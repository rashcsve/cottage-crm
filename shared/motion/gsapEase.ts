"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { EASE_BEZIER } from "./easing";

export const GSAP_EASE_NAME = "landingEase";

gsap.registerPlugin(CustomEase);

const [x1, y1, x2, y2] = EASE_BEZIER;
CustomEase.create(GSAP_EASE_NAME, `M0,0 C${x1},${y1} ${x2},${y2} 1,1`);
