/*
* ----------------------------------------------
* Copyright (c) 2023 Robert Mayhew
* All Rights Reserved
* ----------------------------------------------
 */
import {ActiveTask, ActiveTaskStorage} from "./storage.js";

let taskBtn = null;
let stillWorkingBtn = null;
let wasDistractedBtn = null;
let taskOutput = null;
let taskName = null;

let testTime = 0;
function getTime()
{
    if(testTime > 0)
        return testTime;
    return new Date().getTime();
}

class ActiveTaskController
{
    constructor(storage) {
        this.taskName = "";
        this.storage = storage;
    }

    updateTaskName(name) {
        this.taskName = name;
    }

    async clickTaskBtn() {
        return new Promise((resolve) => {
            let ct = this.storage.currentTask;
            if (ct != null) {
                if (ct.name === this.taskName) {
                    ct.stillWorkingAction();
                    resolve();
                    return;
                } else {
                    ct.complete();
                    this.storage.addOrUpdate(ct);
                }
            }
            ct = new ActiveTask();
            ct.name = this.taskName;
            this.storage.currentTask = ct;
            resolve();
        });
    }

    clickWorkingBtn() {
        const ct = this.storage.currentTask;
        if(!ct)return;
        ct.stillWorkingAction();
        this.storage.currentTask = ct;

    }

    clickDistractedBtn() {
        const ct = this.storage.currentTask;
        if(!ct)return;
        ct.distractedAction();
        this.storage.currentTask = ct;
    }
}

let controller = null;
function taskBtnClicked() {
    controller.updateTaskName(taskName.value);
    controller.clickTaskBtn().then(() => {
        renderTaskOutput();
    });
}

function stillWorkingBtnClicked() {
    controller.updateTaskName(taskName.value);
    controller.clickWorkingBtn();
    renderTaskOutput();
}

function wasDistractedBtnClicked() {
    controller.updateTaskName(taskName.value);
    controller.clickDistractedBtn();
    renderTaskOutput();
}

function renderTaskOutput() {
    const ot = document.getElementById("taskOutput");
    ot.innerHTML = "";
    const ct = controller.storage.currentTask;
    const taskDiv = renderTask(ct);
    ot.appendChild(taskDiv);
    controller.storage.readToday().then(result => {
        if(result.length === 0 && ct == null){
            ot.innerHTML = "No Task";
        }
        for(let t of result) {
            if(t.id === ct.id)continue;
            const taskDiv = renderTask(t);
            ot.appendChild(taskDiv);
        }
    });
}

function renderTask(task) {
    let div = document.createElement("div");
    div.classList.add("task");
    let label = document.createElement("span");
    label.classList.add("taskLabel");
    label.innerHTML = task.name;
    div.appendChild(label);
    let time = document.createElement("span");
    time.classList.add("taskTime");
    time.innerHTML = formatMilliseconds(task.taskLength);
    div.appendChild(time);
    let timeSpan = document.createElement("span");
    timeSpan.classList.add("distractedTime");
    timeSpan.innerHTML = formatMilliseconds(task.timeDistracted);
    div.appendChild(timeSpan);
    return div;
}

function formatMilliseconds(ms) {
    let seconds = Math.floor(ms / 1000);
    let  minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    // Pad the strings to two digits
    seconds = String(seconds).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    hours = String(hours).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
}


let lastReminderSound = 0;
let remindSound = null;
function playReminderSound()
{
    try{
        remindSound.stop();
    }catch(ignored){}
    let p = getTime() - lastReminderSound;

    if(p > 4 * 60 * 1000)
    {
        lastReminderSound = getTime();
        let context = new AudioContext();
        remindSound = context.createOscillator();
        remindSound.type = "sine";
        remindSound.frequency.value = 45.0;
        remindSound.connect(context.destination);
        remindSound.start();
    }
    setTimeout(playReminderSound,500);
}


document.addEventListener('DOMContentLoaded',function () {
    let storage = new ActiveTaskStorage();
    storage.init().then(() =>{
        controller = new ActiveTaskController(storage);
        taskBtn  = document.getElementById("taskBtn");
        stillWorkingBtn = document.getElementById("stillWorking");
        wasDistractedBtn = document.getElementById("wasDistracted");
        taskOutput = document.getElementById("taskOutput");
        taskName = document.getElementById("taskName");
        document.getElementById("activateReminderTone").addEventListener("click", playReminderSound);


        taskBtn.addEventListener("click", taskBtnClicked);
        stillWorkingBtn.addEventListener("click", stillWorkingBtnClicked);
        wasDistractedBtn.addEventListener("click", wasDistractedBtnClicked);
        renderTaskOutput();
    });
});