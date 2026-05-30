document.addEventListener('DOMContentLoaded', () => {
  const shell = document.querySelector('.admin-shell')
  const toggle = document.querySelector('.admin-menu-toggle')
  const backdrop = document.querySelector('.admin-backdrop')
  const sidebarLinks = document.querySelectorAll('.admin-nav a')

  if (!shell || !toggle || !backdrop) return

  const closeMenu = () => {
    shell.classList.remove('menu-open')
    toggle.classList.remove('active')
    toggle.setAttribute('aria-expanded', 'false')
    backdrop.setAttribute('aria-hidden', 'true')
  }

  const openMenu = () => {
    shell.classList.add('menu-open')
    toggle.classList.add('active')
    toggle.setAttribute('aria-expanded', 'true')
    backdrop.setAttribute('aria-hidden', 'false')
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
