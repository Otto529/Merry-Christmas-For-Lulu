const layerOfMystery = document.getElementById('envelope-layer');
const letterToJiali = document.getElementById('jialisEnvelope');
const confirmationModal = document.getElementById('cute-modal-overlay');
const btnYesIDo = document.getElementById('btn-ready');


const loveWordsForLulu = [
     "小许同学圣诞节快乐呀！",
    "小许今天也超级迷人呐～",
    "Lulu要天天开心哦！",
    "小许要天天开心！",
    "要在小许的眼睛里看烟花！",
    "要按时吃吃饭哦～",
    "偷看小许被发现了～",
    "全世界最可爱的小许ovo",
    "小许也要照顾好自己呐～",
];

// 永远都不要离开你，小许呜呜呜
export function waitForJiali(whenSheOpensTheLetter, whenSheSaysYes) {
    
    //只想永远陪在小许身边～
    let hasSheClicked = false;
    letterToJiali.addEventListener('click', (e) => {
        e.stopPropagation();
        if (hasSheClicked) return;
        hasSheClicked = true;

        
        letterToJiali.classList.add('open');
        document.querySelector('.heart-seal').style.opacity = '0';
        document.getElementById('tipText').style.opacity = '0';

       
        whenSheOpensTheLetter();

        
        setTimeout(() => {
            confirmationModal.classList.add('show');
        }, 800);
    });

    
    btnYesIDo.addEventListener('click', () => {
        confirmationModal.classList.remove('show');
        layerOfMystery.classList.add('hidden'); 
        
        
        whisperSweetNothings();
        
        
        whenSheSaysYes();
    });
}


function whisperSweetNothings() {
    setInterval(sendOneLoveLetter, 1500);
    sendOneLoveLetter();
}
// 送出一封爱的悄悄话～
function sendOneLoveLetter() {


    const whisper = document.createElement('div');
    whisper.className = 'whispers-for-jiali';
    whisper.innerText = loveWordsForLulu[Math.floor(Math.random() * loveWordsForLulu.length)];


    whisper.style.top = (Math.random() * 80 + 5) + '%';


    whisper.style.fontSize = (18 + Math.random() * 16) + 'px';


    const duration = 10 + Math.random() * 6;
    whisper.style.transition = `transform ${duration}s linear`;

    document.body.appendChild(whisper);


    setTimeout(() => {
        whisper.style.transform = 'translateX(-150vw)';
    }, 50);

    //要爱许同学到地老天荒呀～
    setTimeout(() => {
        whisper.remove();
    }, duration * 1000);
}
