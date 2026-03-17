import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Routes prefix
const prefix = "/make-server-93f7c220";

// Create storage bucket on startup
const BUCKET_NAME = "make-93f7c220-book-covers";

(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
      console.log(`Created storage bucket: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.log(`Error setting up storage bucket: ${error}`);
  }
})();

// Helper function to get user ID from token
async function getUserId(authHeader: string | null): Promise<string | null> {
  if (!authHeader) {
    console.log("[Auth] No authorization header");
    return null;
  }
  
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    console.log("[Auth] No token in header");
    return null;
  }

  console.log(`[Auth] Validating token (first 30 chars): ${token.substring(0, 30)}...`);
  console.log(`[Auth] Token length: ${token.length}`);

  try {
    // Create a client with the user's token
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
    
    // Get user from the token
    const { data: { user }, error } = await userClient.auth.getUser();
    
    if (error) {
      console.log("[Auth] ❌ Token validation error:", error.message);
      console.log("[Auth] Error details:", JSON.stringify(error));
      return null;
    }
    
    if (!user) {
      console.log("[Auth] ❌ No user found for token");
      return null;
    }
    
    console.log(`[Auth] ✅ Valid token for user: ${user.id} (${user.email})`);
    return user.id;
  } catch (error) {
    console.log("[Auth] ❌ Exception validating token:", error);
    return null;
  }
}

// Sign up route
app.post(`${prefix}/signup`, async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || "Usuário" },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      }
    }, 201);
  } catch (error) {
    console.log(`Error in signup route: ${error}`);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Test route - no auth required
app.get(`${prefix}/test`, async (c) => {
  console.log("[TEST] Test route called");
  const authHeader = c.req.header("Authorization");
  console.log("[TEST] Auth header:", authHeader ? `present (${authHeader.substring(0, 30)}...)` : "missing");
  return c.json({ 
    success: true, 
    message: "Server is working!",
    hasAuthHeader: !!authHeader,
    timestamp: new Date().toISOString()
  });
});

// Upload book cover (requires auth)
app.post(`${prefix}/upload-cover`, async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization"));
    if (!userId) {
      return c.json({ error: "Unauthorized - Please sign in" }, 401);
    }

    const body = await c.req.json();
    const { image, fileName } = body;

    if (!image) {
      return c.json({ error: "Image data is required" }, 400);
    }

    // Convert base64 to buffer
    const base64Data = image.split(',')[1] || image;
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Generate unique filename
    const ext = fileName?.split('.').pop() || 'jpg';
    const uniqueName = `${userId}/${crypto.randomUUID()}.${ext}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueName, buffer, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        upsert: false,
      });

    if (uploadError) {
      console.log(`Error uploading file to storage: ${uploadError.message}`);
      return c.json({ error: "Failed to upload image" }, 500);
    }

    // Get signed URL (valid for 10 years)
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(uniqueName, 315360000); // 10 years in seconds

    if (!urlData?.signedUrl) {
      return c.json({ error: "Failed to generate image URL" }, 500);
    }

    return c.json({ 
      url: urlData.signedUrl,
      path: uniqueName,
    });
  } catch (error) {
    console.log(`Error in upload-cover route: ${error}`);
    return c.json({ error: "Failed to upload cover image" }, 500);
  }
});

// Get all books (requires auth)
app.get(`${prefix}/books`, async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    console.log(`[GET /books] Auth header: ${authHeader ? 'present' : 'missing'}`);
    
    const userId = await getUserId(authHeader);
    if (!userId) {
      console.log(`[GET /books] Unauthorized - no userId`);
      return c.json({ error: "Unauthorized - Please sign in" }, 401);
    }

    console.log(`[GET /books] Fetching books for user: ${userId}`);
    const allBooks = await kv.getByPrefix(`book:${userId}:`);
    console.log(`[GET /books] Found ${allBooks.length} books`);
    
    const sortedBooks = allBooks.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    return c.json({ books: sortedBooks });
  } catch (error) {
    console.log(`[GET /books] Error fetching books: ${error}`);
    return c.json({ error: "Failed to fetch books" }, 500);
  }
});

// Get single book (requires auth)
app.get(`${prefix}/books/:id`, async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization"));
    if (!userId) {
      return c.json({ error: "Unauthorized - Please sign in" }, 401);
    }

    const id = c.req.param("id");
    const book = await kv.get(`book:${id}`);
    
    if (!book) {
      return c.json({ error: "Book not found" }, 404);
    }

    if (book.userId !== userId) {
      return c.json({ error: "Forbidden - Not your book" }, 403);
    }

    return c.json({ book });
  } catch (error) {
    console.log(`Error fetching book: ${error}`);
    return c.json({ error: "Failed to fetch book" }, 500);
  }
});

// Create a new book (requires auth)
app.post(`${prefix}/books`, async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization"));
    if (!userId) {
      return c.json({ error: "Unauthorized - Please sign in" }, 401);
    }

    const body = await c.req.json();
    const book = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: body.status === "completed" ? new Date().toISOString() : null,
    };

    await kv.set(`book:${userId}:${book.id}`, book);

    return c.json(book);
  } catch (error) {
    console.log(`Error creating book: ${error}`);
    return c.json({ error: "Failed to create book" }, 500);
  }
});

// Update a book (requires auth)
app.put(`${prefix}/books/:id`, async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization"));
    if (!userId) {
      return c.json({ error: "Unauthorized - Please sign in" }, 401);
    }

    const bookId = c.req.param("id");
    const existingBook = await kv.get(`book:${userId}:${bookId}`);

    if (!existingBook) {
      return c.json({ error: "Book not found" }, 404);
    }

    const body = await c.req.json();
    const wasCompleted = existingBook.status === "completed";
    const isNowCompleted = body.status === "completed";

    const updatedBook = {
      ...existingBook,
      ...body,
      updatedAt: new Date().toISOString(),
      // Set completedAt when book is marked as completed
      completedAt: isNowCompleted && !wasCompleted 
        ? new Date().toISOString() 
        : isNowCompleted 
          ? existingBook.completedAt 
          : null,
    };

    await kv.set(`book:${userId}:${bookId}`, updatedBook);

    return c.json(updatedBook);
  } catch (error) {
    console.log(`Error updating book: ${error}`);
    return c.json({ error: "Failed to update book" }, 500);
  }
});

// Delete book (requires auth)
app.delete(`${prefix}/books/:id`, async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization"));
    if (!userId) {
      return c.json({ error: "Unauthorized - Please sign in" }, 401);
    }

    const id = c.req.param("id");
    const existingBook = await kv.get(`book:${id}`);
    
    if (!existingBook) {
      return c.json({ error: "Book not found" }, 404);
    }

    if (existingBook.userId !== userId) {
      return c.json({ error: "Forbidden - Not your book" }, 403);
    }

    await kv.del(`book:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting book: ${error}`);
    return c.json({ error: "Failed to delete book" }, 500);
  }
});

// Get reading stats (requires auth)
app.get(`${prefix}/stats`, async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    console.log(`[GET /stats] Auth header: ${authHeader ? 'present' : 'missing'}`);
    
    const userId = await getUserId(authHeader);
    if (!userId) {
      console.log(`[GET /stats] Unauthorized - no userId`);
      return c.json({ error: "Unauthorized - Please sign in" }, 401);
    }

    console.log(`[GET /stats] Fetching stats for user: ${userId}`);
    const allBooks = await kv.getByPrefix(`book:${userId}:`);
    console.log(`[GET /stats] Processing ${allBooks.length} books for stats`);
    
    const booksRead = allBooks.filter((b: any) => b.status === "completed").length;
    const currentlyReading = allBooks.filter((b: any) => b.status === "reading").length;
    
    // Calculate pages this year
    const currentYear = new Date().getFullYear();
    const pagesThisYear = allBooks
      .filter((b: any) => {
        if (b.status === "completed" && b.completedAt) {
          const completedYear = new Date(b.completedAt).getFullYear();
          return completedYear === currentYear;
        }
        return false;
      })
      .reduce((sum: number, b: any) => sum + (b.totalPages || 0), 0);

    console.log(`[GET /stats] Stats calculated: ${booksRead} read, ${currentlyReading} reading, ${pagesThisYear} pages`);
    return c.json({
      booksRead,
      currentlyReading,
      pagesThisYear,
    });
  } catch (error) {
    console.log(`[GET /stats] Error fetching stats: ${error}`);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// Get reading goals (requires auth)
app.get(`${prefix}/goals`, async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    console.log(`[GET /goals] Auth header: ${authHeader ? 'present' : 'missing'}`);
    
    const userId = await getUserId(authHeader);
    if (!userId) {
      console.log(`[GET /goals] Unauthorized - no userId`);
      return c.json({ error: "Unauthorized - Please sign in" }, 401);
    }

    console.log(`[GET /goals] Fetching goals for user: ${userId}`);
    const goals = await kv.get(`goals:${userId}`);
    
    if (!goals) {
      console.log(`[GET /goals] No goals found for user, returning defaults`);
      return c.json({
        yearlyBookGoal: null,
        yearlyPageGoal: null,
      });
    }

    console.log(`[GET /goals] Goals found:`, goals);
    return c.json(goals);
  } catch (error) {
    console.log(`[GET /goals] Error fetching goals: ${error}`);
    return c.json({ error: "Failed to fetch goals" }, 500);
  }
});

// Set reading goals (requires auth)
app.post(`${prefix}/goals`, async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization"));
    if (!userId) {
      return c.json({ error: "Unauthorized - Please sign in" }, 401);
    }

    const body = await c.req.json();
    const { yearlyBookGoal, yearlyPageGoal } = body;

    const goals = {
      yearlyBookGoal: yearlyBookGoal || null,
      yearlyPageGoal: yearlyPageGoal || null,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`goals:${userId}`, goals);

    return c.json(goals);
  } catch (error) {
    console.log(`Error setting goals: ${error}`);
    return c.json({ error: "Failed to set goals" }, 500);
  }
});

Deno.serve(app.fetch);