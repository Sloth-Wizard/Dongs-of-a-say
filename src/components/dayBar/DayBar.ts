import './dayBar.scss'
import { DayBarData, TimeData } from './interfaces'

const oneDayInSeconds = 86400
const fifteenMinutesInSecondes = 900
const customEventName = 'barEvent'
export const customActionEventName = 'manifestAction'

export default class DayBar {
    public dayBar: DayBarData
    protected lastAutoSkip: number
    constructor(private app: HTMLElement) {
        // Create the bar
        this.dayBar = this.createBar()
        this.lastAutoSkip = 0
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
            this.dayBar.bar.timePerPixel = oneDayInSeconds / bar.offsetWidth
            await this.sendBarTimeSignal(this.dayBar.bar.elapsedTime / this.dayBar.bar.timePerPixel)
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
            const time = this.dayBar.bar.elapsedTime

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

        actionsContainer.insertAdjacentElement('beforeend', play)
        actionsContainer.insertAdjacentElement('beforeend', pause)

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
        this.dayBar.bar.element.addEventListener('mouseup', async e => {
            // Get the offset we clicked and compensate the bar's possible paddings or margin on this click position
            const clickOffsetX = e.clientX - this.dayBar.bar.element.offsetLeft

            // Setup our needed times data
            this.sendBarTimeSignal(clickOffsetX)
        })
    }

    /**
     * ### Link an html audio element to the bar to enable live tracking
     * 
     * @param audio - The html audio element
     */
    public async linkAudio(audio: HTMLAudioElement) {
        setInterval(() => {
            this.dayBar.bar.elapsedTime = Math.trunc((this.dayBar.bar.manifestChangeInterval * this.dayBar.bar.dayIntervalPosition) + audio.currentTime)
            this.dayBar.progressbar.progress = this.dayBar.bar.elapsedTime / this.dayBar.bar.timePerPixel
            this.dayBar.progressbar.element.style.width = `${this.dayBar.progressbar.progress}px`

            // When the audio has finished the 15 minutes, skip to the next manifest
            if (audio.currentTime > fifteenMinutesInSecondes /*&& this.lastAutoSkip < this.dayBar.progressbar.progress - (fifteenMinutesInSecondes / 2)*/) {
                console.log('Go to next manifest !')
                console.log('Audio current time in seconds')
                console.log(audio.currentTime)
                console.log('Audio elapsed time')
                console.log(this.dayBar.bar.elapsedTime)
                console.log('Time per pixel on the bar')
                console.log(this.dayBar.bar.timePerPixel)

                // TODO: This sends 2 events when auto switching to next for no reason, needs fixing
                //this.lastAutoSkip = this.dayBar.progressbar.progress
                this.sendBarTimeSignal(this.dayBar.progressbar.progress)
            }
        }, 1000)
    }

    /**
     * ### Link and html video element to the bar to enable live tracking
     * 
     * @param video - The html video element
     */
    public async linkVideo(_: HTMLVideoElement) {
        
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
        const timeSeconds = (clickPosition) ? this.dayBar.bar.timePerPixel * clickPosition : this.dayBar.bar.startTime
        
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
        this.dayBar.bar.element.dispatchEvent(new CustomEvent(customEventName, { detail: times, bubbles: true, cancelable: true }))
    }
}
