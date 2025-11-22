// Disable SSR for the entire app to avoid Vercel serverless function issues
export const ssr = false;

// Enable prerendering for static pages
export const prerender = false;

// This is required to make the layout work
export const load = () => {
	return {};
};

