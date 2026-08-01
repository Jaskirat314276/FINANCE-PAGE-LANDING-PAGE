import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once — every landing module imports gsap from here.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
