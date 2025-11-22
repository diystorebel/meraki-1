import { w as writable } from "./index.js";
import "./supabaseClient.js";
import "browser-image-compression";
const categoriesStore = writable([]);
const menuStore = writable([]);
export {
  categoriesStore as c,
  menuStore as m
};
