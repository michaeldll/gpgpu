import gsap, { Expo } from 'gsap'

export default class DOMController {
  constructor() {
  }

  initIntro() {
    const container = document.querySelector('.loader')
    const twentyOne = document.querySelector('.loader__mask__21')
    const twentyTwo = document.querySelector('.loader__mask__22')

    gsap.to(twentyOne, { autoAlpha: 1, skewY: -10, y: "-100%", duration: 1.1, ease: Expo.easeInOut })
    gsap.from(twentyTwo, { autoAlpha: 0, skewY: -10, y: "100%", duration: 1.1, ease: Expo.easeInOut })
    gsap.to(container, { autoAlpha: 0, duration: 0.5, ease: Expo.easeInOut, delay: 1.1 })
  }
}