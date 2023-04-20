import './style.scss'

import { hlsData, m3u8 } from './tools/m3u8Handler'
import { autoplay } from './tools/autoplay'
import { windowSoundEvents } from './tools/windowEvents'
import { customActionEventName } from './components/dayBar/DayBar'
import { lazyloader } from './tools/lazyloader'
import { keybinds } from './tools/keyboard'

// Prepare an empty hls object
let hls: hlsData = { manifestPath: '' }

async function start() {
    const app = document.querySelector<HTMLDivElement>('#app')
    if (!app) {
        return console.error('Missing `#app` container')
    }

    // Prepare both components
    const elements = prepareElements(app)
   
    // Create the 24h bar
    const DayBar = (await import('./components/dayBar/DayBar')).default
    const dayBarModule = new DayBar(app, elements.audio)
    const dayBar = dayBarModule.dayBar

    // Prepare the correct manifest element to load
    dayBar.bar.element.addEventListener(dayBar.bar.customEvent, async ev => {
        const manifest = m3u8.manifest.prepare(ev as CustomEvent, dayBar)
        hls = await m3u8.hls.loadSource(hls, elements.audio, manifest)
        
        if (elements.audio.paused) {
            await autoplay.playAudio(elements.audio)
        }
        
        if (elements.video.paused) {
            await elements.video.play()
        }
    })

    // Load the initial hls manifest at this time of day
    dayBar.bar.element.dispatchEvent(
        new CustomEvent(dayBar.bar.customEvent, {
            detail: {
                seconds: 10795,//dayBar.bar.startTime,
                minutes: dayBar.bar.startTime / 60,
                hours: dayBar.bar.startTime / 3600,
                interval: dayBar.bar.manifestChangeInterval,
                day: dayBar.bar.totalTime
            }
        })
    )

    // Check if we can play the audio and video or not
    autoplay.init(app, elements.audio, elements.video)

    // Listen to the window sound events
    window.addEventListener(customActionEventName, ev => {
        windowSoundEvents(elements.audio, elements.video, ev as CustomEvent)
    })
}

/**
 * ### Prepare DOM elements to be injected into the DOM
 * 
 * @param app - Our main app container
 * 
 * @returns An object containing the `<audio>` and `<video>` elements
 */
function prepareElements(app: HTMLElement): {audio: HTMLAudioElement, video: HTMLVideoElement} {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.controls = true
    audio.setAttribute('type', 'application/x-mpegURL')
    audio.style.display = 'none'

    // Handle keybindings linked to audio
    keybinds(audio)

    const videoContainer = document.createElement('div')
    videoContainer.classList.add('video')

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.controls = false
    video.muted = true
    video.playsInline = true
    video.loop = true
    video.playbackRate = 0.25
    video.autoplay = true

    // Handle the video lazyloading
    lazyloader.video([video])

    const source = document.createElement('source')
    source.dataset.src = `${import.meta.env.BASE_URL}/video/vid.mp4#t=0.1`
    source.type = 'video/mp4'

    video.insertAdjacentElement('beforeend', source)
    videoContainer.insertAdjacentElement('beforeend', video)

    app.insertAdjacentElement('afterbegin', videoContainer)
    app.insertAdjacentElement('beforebegin', audio)

    return {
        audio: audio,
        video: video
    }
}

window.addEventListener('load', async () => {
    start()
})
