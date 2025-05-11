import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  // Await the authentication result
  const user = await auth(); 
  const { userId } = user || {}; // Get userId if authenticated

  // Public routes that don’t require authentication
  const publicRoutes = ["/", "/sign-in", "/sign-up", "/api/webhook", "/video.mp4"];

  // Check if the user is accessing a protected route and is not authenticated
  if (!publicRoutes.includes(req.nextUrl.pathname) && !userId) {
    if (req.nextUrl.pathname === "/sign-in") {
      // Redirect unauthenticated users trying to access the sign-in page to sign-up
      return NextResponse.redirect(new URL("/sign-up?message=create-an-account", req.url));
    }
    // Redirect to sign-up for any other non-public route
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  // Continue if authenticated or on a public route
  return NextResponse.next();
});

// Define the matcher for routes where middleware should run
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
