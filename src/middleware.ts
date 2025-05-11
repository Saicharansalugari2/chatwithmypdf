import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = (await auth()) || {}; // Get the user ID if authenticated

  // Defined public routes that don't need authentication
  const publicRoutes = ["/", "/sign-in", "/sign-up", "/api/webhook", "/video.mp4"];

  // If the user is not authenticated and trying to access a protected route, redirect
  if (!publicRoutes.includes(req.nextUrl.pathname) && !userId) {
    if (req.nextUrl.pathname === "/sign-in") {
      // Redirected unauthenticated users trying to access the sign-in page to the sign-up page
      return NextResponse.redirect(new URL("/sign-up?message=create-an-account", req.url));
    }
    // For other non-public routes, just redirect to sign-up
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  return NextResponse.next(); // Allow access if authenticated or on a public route
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
