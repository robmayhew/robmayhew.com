window.DEBUG_TEXT_ANIMATION = false;
window.DEBUG_GRAPH_ANIMATION = false;
window.DEBUG_SECONDARY_TEXT_ANIMATION = false;
;
document.addEventListener('DOMContentLoaded', function() {
    window.statuModels = [];
    for(let i = 0; i < 4; i++){
        window.statuModels.push(new StatusModel());
    }
    window.statuModels[0].color = 'rgba(65,94,2,0.64)';
    window.statuModels[0].text = 'P U L';
    window.statuModels[0].secondaryTxt = 'NONE';

    window.statuModels[1].color = 'rgba(21,33,117,0.64)';
    window.statuModels[1].text = 'F L X';
    window.statuModels[1].secondaryTxt = 'EMAIL BRETT';

    window.statuModels[2].color = 'rgb(119,7,36)';
    window.statuModels[2].text = 'M E T';
    window.statuModels[2].secondaryTxt = '14:23';

    window.statuModels[3].color = 'rgba(6,44,183,0.64)';
    window.statuModels[3].text = 'J R A';
    window.statuModels[3].secondaryTxt = 'DEV-48321';

    const mainLoop = new MainLoop();
    requestAnimationFrame(mainLoop.loop);
});

document.addEventListener('keyup', function(e) {
    // Detect backspace
    let editing = -1;
    for(let i = 0; i < window.statuModels.length; i++){
        if(window.statuModels[i].editing)
        {
            editing = i;
        }
    }
    if(editing === -1)
        return;
    if(e.key === 'Backspace')
    {
        window.statuModels[editing].secondaryTxt = window.statuModels[editing].secondaryTxt.slice(0, -1);
    }
    // Add key to the text
    else if(e.key.length === 1)
    {
        // force to uppercase
        let val = e.key.toUpperCase();
        window.statuModels[editing].secondaryTxt += val;
    }else{


    }
});

document.addEventListener('click', (e) => {
    let lx = e.clientX;
    let ly = e.clientY;

    console.log('click');
    for(let i = 0; i < window.statuModels.length; i++){
        let sb = window.statuModels[i];
        if(lx >= sb.x && lx <= sb.x + sb.width && ly >= sb.y && ly <= sb.y + sb.height)
        {
            console.log(`Clicked on ${sb.text}`);
            sb.editing = !sb.editing;
        }else{
            sb.editing = false;
        }
    }
    return true;


});


class MainLoop {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.fps = 30;
        this.interval = 1000 / this.fps;
        this.lastTime = 0;
        this.currentTime = 0;
        this.delta = 0;
        this.lastFlip = 0;
        const gap = this.width * 0.03; // 3% gap of the total width
        const smallRectWidth = (this.width - gap) / 2;
        const smallRectHeight = (this.height - gap) / 2;

        const panels = [
            { x: 0, y: 0, width: smallRectWidth, height: smallRectHeight }, // Top-left rectangle
            { x: smallRectWidth + gap, y: 0, width: smallRectWidth, height: smallRectHeight }, // Top-right rectangle
            { x: 0, y: smallRectHeight + gap, width: smallRectWidth, height: smallRectHeight }, // Bottom-left rectangle
            { x: smallRectWidth + gap, y: smallRectHeight + gap, width: smallRectWidth, height: smallRectHeight } // Bottom-right rectangle
        ];
        this.statusBoxes = [];
        for(let i = 0; i < panels.length; i++){
            this.statusBoxes.push(new StatusBox(window.statuModels[i],panels[i].x,panels[i].y ,panels[i].width,panels[i].height));
            let sm = window.statuModels[i];
            sm.x = panels[i].x;
            sm.y = panels[i].y;
            sm.width = panels[i].width;
            sm.height = panels[i].height;

        }

        this.loop = this.loop.bind(this);
    }

    loop(timestamp) {
        this.currentTime = timestamp;
        this.delta = this.currentTime - this.lastTime;
        if (this.delta > this.interval) {
            //this.ctx.clearRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.lastTime = this.currentTime - (this.delta % this.interval);
            for(let i = 0; i < this.statusBoxes.length; i++){
                this.statusBoxes[i].render(this.ctx);
                this.statusBoxes[i].tick();
            }
        }
        // let passed = timestamp - this.lastFlip;
        // if(passed > (10000 * Math.random() + 30000))
        // {
        //     this.lastFlip = timestamp;
        //     window.statuModels =  window.statuModels.slice().reverse();
        // }
        for(let i = 0; i < this.statusBoxes.length; i++){
            this.statusBoxes[i].statusModel = window.statuModels[i];
        }

        requestAnimationFrame(this.loop);
    }
}

class StatusBox{
    // takes in a string to render and a color for the background
    constructor(statusModel, x,y,width, height){
        this.statusModel = statusModel;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.fontSize = this.height * .2;
        this.tickCount = 0;0
        this.tickAnimationAt = Math.random() * 1000 + 100;
        this.animation = null;
        // Add listener to detect mouse clicks in this rectangle

    }

    // Render the text in the center of the context with the background color wih a gradent to a sligtly darker color
    render(ctx){
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = Math.floor(this.fontSize) + "px Audiowide";

        ctx.fillStyle = this.statusModel.color;
        const x = this.x;
        const y = this.y;
        const h = this.height;
        const w = this.width;
        // fill a rounded rectangle with the text
        this.drawRoundedRect(ctx,x, y, w, h);
        ctx.fillStyle = 'white';
        if(this.statusModel.editing)
        {
            ctx.font = Math.floor(this.fontSize * .75) + "px Audiowide";
            ctx.fillText(this.statusModel.secondaryTxt, x + w / 2, y + w / 2 - (h / 12));

        }else {
            if (this.animation != null) {
                this.animation.render(ctx);
            } else {
                ctx.fillText(this.statusModel.text, x + w / 2, y + w / 2 - (h / 12));
                ctx.font = Math.floor(this.fontSize * .2) + "px Audiowide";
                ctx.fillText(this.statusModel.secondaryTxt, x + w / 2 - (w / 5), y + h / 2 - (h / 12));
            }
        }

        ctx.restore();
    }

    buildAnimation()
    {
        if(DEBUG_TEXT_ANIMATION) {
            this.animation = new FlashingLinesAnimation(this.x, this.y);
            return;
        }

        if(DEBUG_GRAPH_ANIMATION) {
            this.animation = new GraphAnimation(this.x, this.y);
            return;
        }
        if(DEBUG_SECONDARY_TEXT_ANIMATION)
        {
            this.animation = new SecondaryTextAnimation(this.x, this.y, this.width, this.height, this.statusModel.secondaryTxt);
            return;
        }
        let r = Math.random() * 100;
        if(r > 90)
        {
            this.animation = new FlashingLinesAnimation(this.x, this.y);
        }else if(r > 60){
            this.animation = new GraphAnimation(this.x, this.y);
        }else{
            this.animation = new SecondaryTextAnimation(this.x, this.y, this.width, this.height, this.statusModel.secondaryTxt);
        }

    }

    tick()
    {
        this.tickCount++;

        if(this.tickCount > this.tickAnimationAt || DEBUG_TEXT_ANIMATION || DEBUG_GRAPH_ANIMATION || DEBUG_SECONDARY_TEXT_ANIMATION)
        {
            if(this.animation == null)
            {
                this.buildAnimation();
            }else{
                this.animation.tick();
                if(this.animation.done)
                {
                    this.animation = null;
                    this.tickCount = 0;
                    this.tickAnimationAt = (Math.random() * 1000 + 300) + 500;
                }
            }
        }
    }

    drawRoundedRect(ctx, x, y, width, height, borderRadius) {
        if (typeof borderRadius === 'undefined') {
            borderRadius = width * .05;
        }

        ctx.beginPath();
        ctx.moveTo(x + borderRadius, y);
        ctx.lineTo(x + width - borderRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
        ctx.lineTo(x + width, y + height - borderRadius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
        ctx.lineTo(x + borderRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
        ctx.lineTo(x, y + borderRadius);
        ctx.quadraticCurveTo(x, y, x + borderRadius, y);
        ctx.closePath();



        function darkenColor(rgba, darkenPercent) {
            const parts = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)/);
            if (!parts) {
                //console.error('Invalid RGBA color format');
                return rgba;
            }

            const r = Math.max(0, parseInt(parts[1]) - parseInt(parts[1]) * darkenPercent / 100);
            const g = Math.max(0, parseInt(parts[2]) - parseInt(parts[2]) * darkenPercent / 100);
            const b = Math.max(0, parseInt(parts[3]) - parseInt(parts[3]) * darkenPercent / 100);
            const a = parts[4]; // Keep alpha the same

            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }

        var gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, darkenColor(this.statusModel.color, 10)); // Dark color at the top
        gradient.addColorStop(1,  this.statusModel.color); // Light color at the bottom

        // Apply gradient
        ctx.fillStyle = gradient;

        // You can fill or stroke the rectangle as needed
        ctx.fill(); // Fill the rectangle
        // ctx.stroke(); // Outline the rectangle
    }
}

class StatusModel
{
    constructor() {
        this.color = 'rgba(45,61,2,0.64)';
        this.text = 'C N T';
        this.secondaryTxt = 'CER: 80-KJ';
        this.editing = false;

    }
}

class FlashingLinesAnimation
{
    constructor(x,y) {
        this.x = x;
        this.y = y;
        function r() {
            return Math.floor(Math.random() * (999 - 100 + 1) + 100);
        }
        this.done = false;
        this.count = 0;
        this.blank = false;

        this.lines = [
            "SYS   CTX   LVL   STA",
            "=====================",
        ];
        this.textSprites = [];
        for(let y = 0; y < 10; y++)
        {
            for(let x = 0; x < 4; x++)
            {
                let s = new TextSprite("" + r(),
                    this.x + (x *65) + 40,
                    this.y + (y * 20) + 70);
                s.appearAt = 30 + Math.random() * 100;
                s.disappearAt = s.appearAt + 10 + Math.random() * 100;
                s.flashStart = 100 + Math.random() * 100;
                s.flashEnd = s.flashStart + 10 + Math.random() * 10;
                this.textSprites.push(s);
            }
        }

    }


    tick()
    {
        this.count++;
        if(this.count > 200)
        {
            this.blank = true;
        }
        if(this.count > 250)
        {
            this.done = true;
        }
        for(let i = 0; i < this.textSprites.length; i++){
            this.textSprites[i].tick();
        }
    }

    render(ctx)
    {
        if(this.blank)
            return;
        ctx.save();

        ctx.font = "20px Audiowide";
        ctx.fillStyle = 'white';
        for(let i = 0; i < this.lines.length; i++){
            let c = i * 5;
            if(this.count > c) {
                ctx.fillText(this.lines[i], this.x + 160, this.y + (i * 20) + 30);
            }
        }
        for(let i = 0; i < this.textSprites.length; i++){
            this.textSprites[i].render(ctx);
        }
        ctx.restore();
    }
}

class TextSprite
{
    constructor(text, x,y) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.canFlash = true;
        this.appearAt = 0;
        this.disappearAt = 0;
        this.count = 0;
        this.flashStart = 0;
        this.flashEnd = 0;
    }

    render(ctx)
    {
        ctx.save();
        if(this.isShowing()){
            ctx.font = "20px Audiowide";
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(this.text, this.x, this.y);
        }
        ctx.restore();
    }

    tick(){
        this.count++;
    }

    isShowing()
    {
        let shown = false;
        let flash = false;
        if(this.disappearAt > 0)
        {
            shown = this.count > this.appearAt && this.count < this.disappearAt;
        }
        if(this.flashStart > 0)
        {
            if(this.count > this.flashStart && this.count < this.flashEnd)
            {
                let b = this.canFlash;
                this.canFlash = !b;
                flash = b;
            }
        }
        return shown || flash;
    }
}


class FilledCube
{
    constructor(x,y,w,h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

}

class GraphAnimation
{
    constructor(x,y) {
        this.x = x;
        this.y = y;
        function r() {
            return Math.floor(Math.random() * (999 - 100 + 1) + 100);
        }
        this.done = false;
        this.count = 0;
        this.blank = false;

        this.lines = [
            "SYS   CTX   LVL   STA",
            "=====================",
        ];
        this.filledCubes = [];

        this.cubes = [];
        for(let y=0; y < 9; y++)
        {
            for(let x=0; x < 4; x++)
            {
                if(Math.random() * 10 > 7)
                {
                    this.cubes.push(new FilledCube(
                        this.x + (x * 65) + 20,
                        this.y + (y * 20) + 20,
                        20,
                        20
                    ));
                }
            }
        }

    }


    tick()
    {
        this.count++;
        if(this.count > 200)
        {
            this.blank = true;
        }
        if(this.count > 250)
        {
            this.done = true;
        }


    }

    render(ctx)
    {
        if(this.blank)
            return;
        ctx.save();

        ctx.font = "20px Audiowide";
        ctx.fillStyle = 'white';
        if(this.count > 20)
        {
            ctx.strokeStyle = '#cec8c8';

            ctx.beginPath();
            ctx.moveTo(this.x + 20, this.y + 20);
            for(let y = 0; y < 10; y++)
            {
                ctx.moveTo(this.x + 20, this.y + 20 + (y * 20));
                ctx.lineTo(this.x + 280, this.y + 20 + (y * 20));
            }
            for(let x = 0; x < 5; x++)
            {
                ctx.moveTo(this.x + 20 + (x * 65), this.y + 20);
                ctx.lineTo(this.x + 20 + (x * 65), this.y + 200);
            }
            ctx.stroke();
        }
        for(let i = 0; i < this.cubes.length; i++){
            let c = 40 + (i * 5);
            if(this.count > c) {
                ctx.fillRect(this.cubes[i].x+23, this.cubes[i].y+2, this.cubes[i].w-1, this.cubes[i].h-4);
            }
        }
        ctx.restore();
    }
}

class SecondaryTextAnimation
{
    constructor(x,y,w,h ,text) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h  =h;
        this.text = text;
        this.count = 0;
        this.done = false;
    }


    render(ctx)
    {
        if(this.count > 40 && this.count < 230) {
            ctx.save();
            ctx.font = "50px Audiowide";
            ctx.fillStyle = 'white';
            ctx.fillText(this.text, this.x + this.w / 2, this.y + this.w / 2 - (this.h / 12));
            ctx.restore();
        }
    }

    tick()
    {
        this.count++;
        if(this.count > 250)
        {
            this.done = true;
        }
    }
}