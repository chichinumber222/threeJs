import Stats from 'stats.js'


const stats = new Stats()
stats.dom.style.position = 'absolute'
stats.dom.style.top = '0px'
stats.dom.style.left = '0px'
document.body.appendChild(stats.dom)

export { stats }
