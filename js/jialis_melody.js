
const myHeartbeat = document.getElementById('heartbeat-sound'); 
const loveSymphony = document.getElementById('symphony-of-love'); 


export function listenToMyHeartbeat() {
    if (myHeartbeat.paused) {
        myHeartbeat.play().catch(() => console.log("等待小许的点击..."));
    }
}


export function singForJiali() {
    gentleFadeOut(myHeartbeat, () => {
        loveSymphony.volume = 0;
        loveSymphony.play();
        gentleFadeIn(loveSymphony);
    });
}


function gentleFadeOut(audio, callback) {
    let volume = 1;
    const fadeTimer = setInterval(() => {
        if (volume > 0.1) {
            volume -= 0.1;
            audio.volume = volume;
        } else {
            clearInterval(fadeTimer);
            audio.pause();
            if(callback) callback();
        }
    }, 100);
}


function gentleFadeIn(audio) {
    let volume = 0;
    const fadeTimer = setInterval(() => {
        if (volume < 0.9) {
            volume += 0.1;
            audio.volume = volume;
        } else {
            clearInterval(fadeTimer);
        }
    }, 100);
}