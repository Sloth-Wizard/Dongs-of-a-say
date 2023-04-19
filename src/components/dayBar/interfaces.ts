export interface DayBarData {
    container: HTMLElement
    bar: {
        element: HTMLElement
        totalTime: number
        manifestChangeInterval: number
        startTime: number
        elapsedTime: number
        dayIntervalPosition: number
        timePerPixel: number
        customEvent: string
    }
    progressbar: {
        element: HTMLElement
        progress: number
    }
}

export interface TimeData {
    seconds: number
    minutes: number
    hours: number
    interval: number
    day: number
}
