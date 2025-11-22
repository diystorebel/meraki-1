export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["Hero-Image-2-1.webp","Logo-1.jpg","Logo-1.png","cocktail.avif","favicon.png","foto/464380393_18062581504776169_9018645309483448115_n.jpg","foto/482044998_18075078004776169_3981073702097404323_n.jpg","foto/482141395_18075077950776169_674658151553112194_n.jpg","foto/490357660_1222918656505509_5602575941209351744_n.jpg","foto/490514343_1227186139412094_3213265893795458070_n.jpg","foto/491459090_1228415792622462_1361948255831882027_n.jpg","foto/491604832_1225801106217264_4856595056462081739_n.jpg","foto/493224715_1237115798419128_2005457085607310268_n.jpg","foto/505437136_18084963760776169_3033839837320138474_n.jpeg","foto/542519364_18092779978776169_826142037760625783_n.jpeg","foto/561140888_18095767633776169_2498055279704942580_n.jpeg","foto/571185772_18098109010776169_6806449131818416102_n.jpeg","foto/571578760_18098440567776169_5795701599447186277_n.jpeg","foto/573052952_18099232567776169_3089308139293234655_n.jpeg","foto_gruppo.jpg"]),
	mimeTypes: {".webp":"image/webp",".jpg":"image/jpeg",".png":"image/png",".avif":"image/avif",".jpeg":"image/jpeg"},
	_: {
		client: {start:"_app/immutable/entry/start.hKHgMx-r.js",app:"_app/immutable/entry/app.ejB1Yinm.js",imports:["_app/immutable/entry/start.hKHgMx-r.js","_app/immutable/chunks/G7FJbS4K.js","_app/immutable/chunks/CB5cRc80.js","_app/immutable/chunks/Da5tC44D.js","_app/immutable/entry/app.ejB1Yinm.js","_app/immutable/chunks/CB5cRc80.js","_app/immutable/chunks/DdXpAeTr.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:true},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js')),
			__memo(() => import('../output/server/nodes/5.js')),
			__memo(() => import('../output/server/nodes/6.js')),
			__memo(() => import('../output/server/nodes/7.js')),
			__memo(() => import('../output/server/nodes/8.js')),
			__memo(() => import('../output/server/nodes/9.js')),
			__memo(() => import('../output/server/nodes/10.js')),
			__memo(() => import('../output/server/nodes/11.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/chi-siamo",
				pattern: /^\/chi-siamo\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/contatti",
				pattern: /^\/contatti\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/cookie-policy",
				pattern: /^\/cookie-policy\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/eventi",
				pattern: /^\/eventi\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/gallery",
				pattern: /^\/gallery\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/lavora-con-noi",
				pattern: /^\/lavora-con-noi\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/menu",
				pattern: /^\/menu\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/privacy-policy",
				pattern: /^\/privacy-policy\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
