export class SpeechSystem {
    constructor(appModel, readyForNextLine) {
        this.msgs = [];
        this.mons = [];
        this.max = 1;
        this.index = 0;
        this.maxWaitForEnd = 0;
        this.maxWaitForStart = 0;
        this.talkAfterEnd = false;
        this.speechSynthesis = window.speechSynthesis;
        this.appModel = appModel;
        for (let i = 0; i < this.max; i++) {
            this.msgs.push(new SpeechSynthesisUtterance());
            this.mons.push(new SpeechUtteranceMonitor(this.msgs[i], readyForNextLine));
        }
    }
    incrementIndex() {
        this.index++;
        if (this.index >= this.max)
            this.index = 0;
    }
    sayThisNow(text) {
        console.info("sayThisNow " + text);
        this.talkAfterEnd = true;
        this.incrementIndex();
        this.mons[this.index].pendingText = text;
        this.stop();
    }
    breathBeforeTalking() {
        console.log("Breath before talking");
        let self = this;
        let text = self.mons[self.index].pendingText;
        setTimeout(self.waitForTalking.bind(self), 100);
    }
    waitForTalking() {
        let self = this;
        let sm = self.appModel.speechControl;
        let text = self.mons[self.index].pendingText;
        if (!self.mons[self.index].hasStarted()) {
            self.msgs[self.index].text = self.mons[self.index].pendingText;
            self.msgs[self.index].rate = sm.rate;
            self.msgs[self.index].pitch = sm.pitch;
            self.speechSynthesis.speak(self.msgs[self.index]);
            console.log("Trying to start " + self.mons[self.index].pendingText);
            if (self.maxWaitForStart < new Date().getTime()) {
                console.error("Failed to wait for start. Never happened. Text " + self.mons[self.index].pendingText);
                return;
            }
            console.log("Adding " + text + " to backlog");
            setTimeout(function () { console.log("Running timateou"); self.waitForTalking.bind(this); }.bind(self), 1000);
        }
        else {
            console.info("Started saying " + self.mons[self.index].pendingText);
        }
    }
    stop() {
        for (let mon of this.mons) {
            mon.killed = true;
        }
        this.speechSynthesis.cancel();
        this.maxWaitForEnd = new Date().getTime() + 100;
        this.waitForEnd(); // see allHaveEnded
    }
    allHaveEnded() {
        for (let mon of this.mons) {
            mon.reset();
        }
        this.maxWaitForStart = new Date().getTime() + 2000;
        this.breathBeforeTalking();
        console.log("All have ended");
    }
    waitForEnd() {
        let self = this;
        if (self.haveAllEnded()) {
            self.allHaveEnded();
            return;
        }
        if (this.maxWaitForEnd < new Date().getTime()) {
            console.error("speechControl: Could not wait for ending");
            self.allHaveEnded();
            return;
        }
        setTimeout(self.waitForEnd.bind(self), 10);
    }
    haveAllEnded() {
        for (let mon of this.mons) {
            if (mon.hasStarted() && !mon.hasStopped()) {
                return false;
            }
        }
        return true;
    }
}
class SpeechUtteranceMonitor {
    constructor(stu, nll) {
        this.started = 0;
        this.stopped = 0;
        this.killed = false;
        this.pendingText = null;
        let self = this;
        stu.addEventListener("start", function () {
            self.started = new Date().getTime();
            console.log("Started utterance");
        });
        stu.addEventListener("end", function () {
            self.stopped = new Date().getTime();
            if (!self.killed) {
                nll();
            }
        });
    }
    reset() {
        this.started = 0;
        this.stopped = 0;
        this.killed = false;
    }
    hasStarted() {
        return this.started > 0;
    }
    hasStopped() {
        return this.stopped > 0;
    }
}
