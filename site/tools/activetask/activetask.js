/*
* ----------------------------------------------
* Copyright (c) 2023 Robert Mayhew
* All Rights Reserved
* ----------------------------------------------
 */
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

class ActiveTask
{
    constructor() {
        this.id = 0;
        this.started = getTime();
        this.name = null;
        this.lastCheckin = getTime();
        this.timeDistracted = 0;
        this.distracted = false;
        this.taskLength = 0;
    }

    stillWorkingAction()
    {
        if(this.started <= 0) {
            console.error("Cannot checkin task that has not started");
            return;
        }
        if(this.distracted)
        {
            this.distractedAction();
            this.distracted = false;
        }else{
            let n = getTime();
            let p = n - this.lastCheckin;
            this.lastCheckin = n;
            this.taskLength += p;
        }
    }

    distractedAction()
    {
        let n = getTime();
        let p = n - this.lastCheckin;
        this.distracted = true;
        this.lastCheckin = n;
        this.timeDistracted += p;
    }

    complete()
    {
        if(this.started <= 0) {
            console.error("Cannot complete task that has not started");
            return;
        }
        this.stillWorkingAction()
    }
}

class ActiveTaskStorage
{
    constructor() {
        this.currentTask = null;
        this.nextTaskId = 0;
        this.savedTasks = [];
    }

    nextId()
    {
        this.nextTaskId++
        return this.nextTaskId;
    }
}

class ActiveTaskController
{
    constructor() {
        this.taskName = "";
        this.storage = new ActiveTaskStorage();
    }

    updateTaskName(name) {
        this.taskName = name;
    }

    clickTaskBtn() {
        let ct = this.storage.currentTask;
        if(ct != null) {
            if(ct.name === this.taskName) {
                ct.stillWorkingAction();
                return;
            }
            else {
                ct.complete();
                this.storage.savedTasks.push(ct);
            }
        }
        ct = new ActiveTask();
        ct.name = this.taskName;
        ct.id = this.storage.nextId();
        this.storage.currentTask = ct;
    }

    clickWorkingBtn() {
        const ct = this.storage.currentTask;
        if(!ct)return;
        ct.stillWorkingAction()

    }

    clickDistractedBtn() {
        const ct = this.storage.currentTask;
        if(!ct)return;
        ct.distractedAction();
    }
}

const controller = new ActiveTaskController();
function taskBtnClicked() {
    controller.updateTaskName(taskName.value);
    controller.clickTaskBtn();
    renderTaskOutput();
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
    if(ct == null) {
        ot.innerHTML = "No Task";
        return;
    }
    const taskDiv = renderTask(ct);
    ot.appendChild(taskDiv);
    controller.storage.savedTasks.forEach(function (task) {
        const iTaskDiv = renderTask(task);
        ot.appendChild(iTaskDiv);
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
    let dtime = document.createElement("span");
    dtime.classList.add("distractedTime");
    dtime.innerHTML = formatMilliseconds(task.timeDistracted);
    div.appendChild(dtime);
    return div;
}

function formatMilliseconds(ms) {
    var seconds = Math.floor(ms / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;
    hours = hours;

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
    setTimeout(playReminderSound,500);;
}


document.addEventListener('DOMContentLoaded',function () {
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