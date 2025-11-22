import{r as U,s as H,c as V,a as y,u as X,g as Y,b as Z,p as q,e as D}from"./CB5cRc80.js";import{a as J,t as K,S as p,i as x,e as N,x as $,I as S,f as I,g as ee,D as L,j as Q,w as j,E as R}from"./DdXpAeTr.js";function O(t){return(t==null?void 0:t.length)!==void 0?t:Array.from(t)}function ie(t,s){K(t,1,1,()=>{s.delete(t.key)})}function oe(t,s,o,i,l,f,h,a,c,d,_,k){let e=t.length,u=f.length,n=e;const v={};for(;n--;)v[t[n].key]=n;const b=[],w=new Map,z=new Map,M=[];for(n=u;n--;){const r=k(l,f,n),m=o(r);let g=h.get(m);g?M.push(()=>g.p(r,s)):(g=d(m,r),g.c()),w.set(m,b[n]=g),m in v&&z.set(m,Math.abs(n-v[m]))}const A=new Set,B=new Set;function C(r){J(r,1),r.m(a,_),h.set(r.key,r),_=r.first,u--}for(;e&&u;){const r=b[u-1],m=t[e-1],g=r.key,W=m.key;r===m?(_=r.first,e--,u--):w.has(W)?!h.has(g)||A.has(g)?C(r):B.has(W)?e--:z.get(g)>z.get(W)?(B.add(g),C(r)):(A.add(W),e--):(c(m,h),e--)}for(;e--;){const r=t[e];w.has(r.key)||c(r,h)}for(;u;)C(b[u-1]);return U(M),b}function T(t,s){const o={},i={},l={$$scope:1};let f=t.length;for(;f--;){const h=t[f],a=s[f];if(a){for(const c in h)c in a||(i[c]=1);for(const c in a)l[c]||(o[c]=a[c],l[c]=1);t[f]=a}else for(const c in h)l[c]=1}for(const h in i)h in o||(o[h]=void 0);return o}function fe(t){return typeof t=="object"&&t!==null?t:{}}/**
 * @license lucide-svelte v0.554.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 * ---
 * 
 * The MIT License (MIT) (for portions derived from Feather)
 * 
 * Copyright (c) 2013-2023 Cole Bemis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */const P={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};function F(t,s,o){const i=t.slice();return i[11]=s[o][0],i[12]=s[o][1],i}function E(t){let s,o=[t[12]],i={};for(let l=0;l<o.length;l+=1)i=y(i,o[l]);return{c(){s=R(t[11]),this.h()},l(l){s=L(l,t[11],{}),Q(s).forEach(N),this.h()},h(){S(s,i)},m(l,f){I(l,s,f)},p(l,f){S(s,i=T(o,[f&32&&l[12]]))},d(l){l&&N(s)}}}function G(t){let s=t[11],o,i=t[11]&&E(t);return{c(){i&&i.c(),o=j()},l(l){i&&i.l(l),o=j()},m(l,f){i&&i.m(l,f),I(l,o,f)},p(l,f){l[11]?s?H(s,l[11])?(i.d(1),i=E(l),s=l[11],i.c(),i.m(o.parentNode,o)):i.p(l,f):(i=E(l),s=l[11],i.c(),i.m(o.parentNode,o)):s&&(i.d(1),i=null,s=l[11])},d(l){l&&N(o),i&&i.d(l)}}}function te(t){let s,o,i,l,f,h=O(t[5]),a=[];for(let e=0;e<h.length;e+=1)a[e]=G(F(t,h,e));const c=t[10].default,d=V(c,t,t[9],null);let _=[P,t[7],{width:t[2]},{height:t[2]},{stroke:t[1]},{"stroke-width":i=t[4]?Number(t[3])*24/Number(t[2]):t[3]},{class:l=t[6]("lucide-icon","lucide",t[0]?`lucide-${t[0]}`:"",t[8].class)}],k={};for(let e=0;e<_.length;e+=1)k=y(k,_[e]);return{c(){s=R("svg");for(let e=0;e<a.length;e+=1)a[e].c();o=j(),d&&d.c(),this.h()},l(e){s=L(e,"svg",{width:!0,height:!0,stroke:!0,"stroke-width":!0,class:!0});var u=Q(s);for(let n=0;n<a.length;n+=1)a[n].l(u);o=j(),d&&d.l(u),u.forEach(N),this.h()},h(){S(s,k)},m(e,u){I(e,s,u);for(let n=0;n<a.length;n+=1)a[n]&&a[n].m(s,null);ee(s,o),d&&d.m(s,null),f=!0},p(e,[u]){if(u&32){h=O(e[5]);let n;for(n=0;n<h.length;n+=1){const v=F(e,h,n);a[n]?a[n].p(v,u):(a[n]=G(v),a[n].c(),a[n].m(s,o))}for(;n<a.length;n+=1)a[n].d(1);a.length=h.length}d&&d.p&&(!f||u&512)&&X(d,c,e,e[9],f?Z(c,e[9],u,null):Y(e[9]),null),S(s,k=T(_,[P,u&128&&e[7],(!f||u&4)&&{width:e[2]},(!f||u&4)&&{height:e[2]},(!f||u&2)&&{stroke:e[1]},(!f||u&28&&i!==(i=e[4]?Number(e[3])*24/Number(e[2]):e[3]))&&{"stroke-width":i},(!f||u&257&&l!==(l=e[6]("lucide-icon","lucide",e[0]?`lucide-${e[0]}`:"",e[8].class)))&&{class:l}]))},i(e){f||(J(d,e),f=!0)},o(e){K(d,e),f=!1},d(e){e&&N(s),$(a,e),d&&d.d(e)}}}function se(t,s,o){const i=["name","color","size","strokeWidth","absoluteStrokeWidth","iconNode"];let l=q(s,i),{$$slots:f={},$$scope:h}=s,{name:a=void 0}=s,{color:c="currentColor"}=s,{size:d=24}=s,{strokeWidth:_=2}=s,{absoluteStrokeWidth:k=!1}=s,{iconNode:e=[]}=s;const u=(...n)=>n.filter((v,b,w)=>!!v&&w.indexOf(v)===b).join(" ");return t.$$set=n=>{o(8,s=y(y({},s),D(n))),o(7,l=q(s,i)),"name"in n&&o(0,a=n.name),"color"in n&&o(1,c=n.color),"size"in n&&o(2,d=n.size),"strokeWidth"in n&&o(3,_=n.strokeWidth),"absoluteStrokeWidth"in n&&o(4,k=n.absoluteStrokeWidth),"iconNode"in n&&o(5,e=n.iconNode),"$$scope"in n&&o(9,h=n.$$scope)},s=D(s),[a,c,d,_,k,e,u,l,s,h,f]}class ae extends p{constructor(s){super(),x(this,s,se,te,H,{name:0,color:1,size:2,strokeWidth:3,absoluteStrokeWidth:4,iconNode:5})}}export{ae as I,fe as a,O as e,T as g,ie as o,oe as u};
