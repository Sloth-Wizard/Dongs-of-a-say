import './dayBar.scss'
import { DayBarData, TimeData } from './interfaces'
import { soundVolume } from './volumeHandler'

const oneDayInSeconds = 86400
const fifteenMinutesInSecondes = 900
const customEventName = 'barEvent'
export const customActionEventName = 'manifestAction'

export default class DayBar {
    public barData: DayBarData
    protected lastAutoSkip: number
    protected skipRetry: number
    constructor(private app: HTMLElement, private audio: HTMLAudioElement) {
        // Create the bar
        this.barData = this.createBar()
        this.lastAutoSkip = 0
        this.skipRetry = 0
        this.linkAudio()
        this.handleClick()
    }

    /**
     * ### Create a status bar for a whole day and add it to the DOM
     * 
     * Starts the progress at the now time of day
     * 
     * All the bars data is in secondes
     * 
     * @returns The bar data
     */
    private createBar(): DayBarData {
        // Container to position the bar
        const barContainer = document.createElement('div')
        barContainer.classList.add('dayBar--container')

        // The bar with all the data
        const bar = document.createElement('daybar')

        // The bar's progressbar
        const progressbar = document.createElement('daybar-progress')
        progressbar.style.width = '0px'

        bar.insertAdjacentElement('beforeend', progressbar)
        barContainer.insertAdjacentElement('beforeend', bar)
        this.app.insertAdjacentElement('beforeend', barContainer)

        // Create the actions
        this.createActions()

        // Create the digital clock linked to the bars progress
        const now = this.createDigitalClock()

        // Calculate the time of day in seconds
        const secondsOfDay = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds()

        // Listen to window resizing and update the bar accordingly
        window.addEventListener('resize', async _ => {
            this.barData.bar.timePerPixel = oneDayInSeconds / bar.offsetWidth
            await this.sendBarTimeSignal(this.barData.bar.elapsedTime / this.barData.bar.timePerPixel)
        })

        return {
            container: barContainer,
            bar: {
                element: bar,
                totalTime: oneDayInSeconds,
                manifestChangeInterval: fifteenMinutesInSecondes,
                startTime: secondsOfDay,
                elapsedTime: secondsOfDay,
                dayIntervalPosition: 0,
                timePerPixel: oneDayInSeconds / bar.offsetWidth,
                customEvent: customEventName
            },
            progressbar: {
                element: progressbar,
                progress: 0
            }
        }
    }

    /**
     * ### Create a digital clock and start it at the now time of day
     * 
     * @returns The current date
     */
    private createDigitalClock(): Date {
        const now = new Date()
        const clockContainer = document.createElement('div')
        const clock = document.createElement('clock')
        clock.innerText = now.toLocaleTimeString()
        setInterval(() => {
            const time = this.barData.bar.elapsedTime

            const hours = Math.floor(time / 3600)
            const minutes = Math.floor((time - (hours * 3600)) / 60)
            const seconds = Math.floor(time - (hours * 3600) - (minutes * 60))

            clock.innerHTML = `<span class="hey">${hours.toLocaleString('en-US', { minimumIntegerDigits: 2 })}</span>:<span class="ho">${minutes.toLocaleString('en-US', { minimumIntegerDigits: 2 })}</span>:<span class="lets-go">${seconds.toLocaleString('en-US', { minimumIntegerDigits: 2 })}</span>`
        }, 1000)

        clockContainer.insertAdjacentElement('afterbegin', clock)
        this.app.insertAdjacentElement('afterbegin', clockContainer)

        return now
    }

    /**
     * ### Create the action buttons and linked listeners
     */
    private createActions() {
        const actionsContainer = document.createElement('div')
        actionsContainer.classList.add('actions')

        const play = document.createElement('play')
        play.addEventListener('click', _ => window.dispatchEvent(new CustomEvent(customActionEventName, { detail: { play: true } })))
        
        const pause = document.createElement('pause')
        pause.addEventListener('click', _ => window.dispatchEvent(new CustomEvent(customActionEventName, { detail: { play: false } })))

        const volume = document.createElement('volume')
        const volumeLess = document.createElement('less')
        volumeLess.innerHTML = '<span>-</span>'

        const volumeMore = document.createElement('more')
        volumeMore.innerHTML = '<span>+</span>'

        // Listen to volume changes
        soundVolume.handleVolume(volumeLess, volumeMore, this.audio)

        const volumeLevelContainer = document.createElement('level')
        // Listen to volume changes and modify the number of levels from the actual audio volume
        soundVolume.setVolumeBar(this.audio, volumeLevelContainer)

        // Add volume levels for the actual audio.volume by sending a `volumechange` event
        this.audio.dispatchEvent(new Event('volumechange'))

        volume.insertAdjacentElement('beforeend', volumeLess)
        volume.insertAdjacentElement('beforeend', volumeLevelContainer)
        volume.insertAdjacentElement('beforeend', volumeMore)

        actionsContainer.insertAdjacentElement('beforeend', play)
        actionsContainer.insertAdjacentElement('beforeend', pause)
        actionsContainer.insertAdjacentElement('beforeend', volume)

        this.app.insertAdjacentElement('afterbegin', actionsContainer)
    }
    
    /**
     * ### Handle the click on the progressbar and move to the clicked time
     * 
     * This is a very approximative way to navigate 24 hours tho
     * 
     * @returns An event so we can hook on it and execute more code
     */
    async handleClick(): Promise<void> {
        this.barData.bar.element.addEventListener('mouseup', async e => {
            // Get the offset we clicked and compensate the bar's possible paddings or margin on this click position
            const clickOffsetX = e.clientX - this.barData.bar.element.offsetLeft

            // Set the last auto skip to the clicked time in seconds
            this.setLastAutoSkip()

            // Setup our needed times data
            this.sendBarTimeSignal(clickOffsetX)
        })
    }

    /**
     * ### Set the progress of the daybar
     * 
     * @param intervalPosition - The position of the bar in the day in seconds
     * @param elapsedTime - The elapsed time on the current 15 minutes track being played in seconds
     * @param progress - The progress given to the progressbar to style it correctly (should be seconds / timePerPixels)
     */
    async setDayBar(intervalPosition: number, elapsedTime: number, progress: number): Promise<void> {
        // Set all the needed data to our dayBar component
        this.barData.bar.dayIntervalPosition = intervalPosition
        this.barData.bar.elapsedTime = elapsedTime
        this.barData.progressbar.progress = progress
    }

    /**
     * ### Link an html audio element to the bar to enable live tracking
     */
    private async linkAudio() {
        setInterval(() => {
            this.barData.bar.elapsedTime = Math.trunc((this.barData.bar.manifestChangeInterval * this.barData.bar.dayIntervalPosition) + this.audio.currentTime)
            this.barData.progressbar.progress = this.barData.bar.elapsedTime / this.barData.bar.timePerPixel
            this.barData.progressbar.element.style.width = `${this.barData.progressbar.progress}px`   

            // When the audio has finished the 15 minutes, skip to the next manifest
            if (this.audio.currentTime > fifteenMinutesInSecondes) {
                console.log('Go to next manifest !')
                console.log('Audio current time in seconds')
                console.log(this.audio.currentTime)
                console.log('Audio elapsed time')
                console.log(this.barData.bar.elapsedTime)
                console.log('Time per pixel on the bar')
                console.log(this.barData.bar.timePerPixel)
                console.log('Last auto skip')
                console.log(this.lastAutoSkip)
                console.log('Retry number')
                console.log(this.skipRetry)

                let targetProgress = this.barData.progressbar.progress
              
                // If we are at the end of the day, meaning 86399 seconds, got to 0
                if (this.barData.bar.elapsedTime >= oneDayInSeconds -1) {
                    targetProgress = 0
                    this.setLastAutoSkip()
                }

                // When not restaring the progressbar at 0
                if (targetProgress !== 0) {
                    // Set new lastAutoSkip when this is triggered at a later time
                    if (this.lastAutoSkip < this.barData.bar.elapsedTime) {
                        this.setLastAutoSkip()
                    }
    
                    // Number of time this is triggered at the same elapsed time, meaning the new sound is not loading properly
                    if (this.lastAutoSkip === this.barData.bar.elapsedTime) {
                        this.skipRetry += 1
                    }
    
                    // Maximum 2 retries
                    if (this.skipRetry >= 2) {
                        targetProgress += 1
                    }
                }
                
                this.sendBarTimeSignal(targetProgress)
            }
        }, 1000)
    }

    /**
     * ### Last auto skip info setup and skipRetry reset
     *
     * @param reset - Resets to the start of a new day, meaning 0 
     */
    public async setLastAutoSkip(reset: boolean = false) {
        this.skipRetry = 0
        this.lastAutoSkip = (reset) ? 0 : Math.trunc((this.barData.bar.manifestChangeInterval * this.barData.bar.dayIntervalPosition) + this.audio.currentTime)
        console.log('setLastAutoSkip')
        console.log(this.lastAutoSkip)
    }

    /**
     * ### Calculates all the times required
     * 
     * @param clickPosition - The possible click position on the bar
     * 
     * @returns A `timeData` in seconds, minutes and hours
     */
    private async getTimes(clickPosition?: number): Promise<TimeData> {
        // The time in seconds we need to jump to
        let timeSeconds = 0

        if (clickPosition === undefined) {
            timeSeconds = this.barData.bar.startTime
        }

        if (clickPosition) {
            timeSeconds = this.barData.bar.timePerPixel * clickPosition
        }
        
        return {
            seconds: timeSeconds,
            minutes: timeSeconds / 60,
            hours: timeSeconds / 3600,
            interval: fifteenMinutesInSecondes,
            day: oneDayInSeconds
        }
    }

    /**
     * ### Send a signal to the active bar on a specified time
     * 
     * @param targetProgress - That targeted time we want to progress to
     */
    private async sendBarTimeSignal(targetProgress: number) {
        const times = await this.getTimes(targetProgress)
        this.barData.bar.element.dispatchEvent(new CustomEvent(customEventName, { detail: times, bubbles: true, cancelable: true }))
    }
}
