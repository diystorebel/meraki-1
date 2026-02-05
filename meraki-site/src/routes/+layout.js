// Enable SSR for SEO and social media crawlers
export const ssr = true;

// Enable prerendering for static pages to improve performance
export const prerender = true;

// This is required to make the layout work
export const load = () => {
	return {};
};

