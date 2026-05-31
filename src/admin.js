document.addEventListener('DOMContentLoaded', () => {
  const shell = document.querySelector('.admin-shell')
  const toggle = document.querySelector('.admin-menu-toggle')
  const backdrop = document.querySelector('.admin-backdrop')
  const sidebarLinks = document.querySelectorAll('.admin-nav a')
  const body = document.body
  let scrollY = 0

  if (!shell || !toggle || !backdrop) return

  const lockScroll = () => {
    scrollY = window.scrollY || window.pageYOffset || 0
    body.classList.add('admin-scroll-lock')
    body.style.top = `-${scrollY}px`
  }

  const unlockScroll = () => {
    body.classList.remove('admin-scroll-lock')
    body.style.top = ''
    window.scrollTo(0, scrollY)
  }

  const closeMenu = () => {
    shell.classList.remove('menu-open')
    toggle.classList.remove('active')
    toggle.setAttribute('aria-expanded', 'false')
    backdrop.setAttribute('aria-hidden', 'true')
    unlockScroll()
  }

  const openMenu = () => {
    shell.classList.add('menu-open')
    toggle.classList.add('active')
    toggle.setAttribute('aria-expanded', 'true')
    backdrop.setAttribute('aria-hidden', 'false')
    lockScroll()
  }

  toggle.addEventListener('click', () => {
    if (shell.classList.contains('menu-open')) {
      closeMenu()
    } else {
      openMenu()
    }
  })

  backdrop.addEventListener('click', closeMenu)

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 980) closeMenu()
    })
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu()
  })
})
