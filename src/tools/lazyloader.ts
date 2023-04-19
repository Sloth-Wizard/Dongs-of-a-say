export const lazyloader = {
    /**
     * ### Lazy load a given video element
     * 
     * @param videos - The video elements to lazyload
     */
    async video(videos: HTMLVideoElement[]) {
        const observer = new IntersectionObserver((entries, observer) => {
            for (const video of entries) {
                if (video.target instanceof HTMLVideoElement && video.isIntersecting) {
                    for (const source in video.target.children) {
                        const videoSource = video.target.children[source]
                        if (
                            videoSource instanceof HTMLSourceElement && 
                            typeof videoSource.tagName === 'string' && 
                            videoSource.tagName === 'SOURCE' &&
                            videoSource.dataset.src
                        ) {
                            videoSource.src = videoSource.dataset.src
                        }
                    }

                    video.target.load()
                    video.target.classList.add('loaded')
                    observer.unobserve(video.target)
                }
            }
        })

        for (const video of videos) {
            observer.observe(video)
        }
    }
}