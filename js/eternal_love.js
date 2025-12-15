import { waitForJiali } from './whisper_to_jiali.js';
import { listenToMyHeartbeat, singForJiali } from './jialis_melody.js';
import { createRomanticWorld, bloomLoveForJiali } from './world_for_jiali.js';

//想永远在你的心里，小许同学～
createRomanticWorld();

//小刘要永远爱小许呀
waitForJiali(
    
    () => {
        listenToMyHeartbeat(); 
    },
    //小许要接受小刘永恒的爱呐～
    
    () => {
        singForJiali(); 
       //让爱在小许的世界里绽放～ 
        //xiao liu loves xiao xu forever~
        setTimeout(() => {
            bloomLoveForJiali(); 
        }, 1000);
    }
);