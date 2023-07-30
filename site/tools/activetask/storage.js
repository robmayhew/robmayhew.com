export class ActiveTaskStorage {
    constructor() {

        this.databaseName = "activeTaskDatabase";
        this.objectStoreName = "activeTaskStorage";
        this.currentTaskLocalStorageKey = "currentTask";
        this.todayStart = this.keyStart();
            }

    async init()
    {
        return new Promise((resolve, reject) => {
            let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            if (!indexedDB) {
                reject("No db support");
            }

            this.db = null;
            let request = indexedDB.open(this.databaseName, 1);
            request.onerror = (event) => {
                reject("Error opening database.",event);
            };
            request.onsuccess = () =>{
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                let objectStore = this.db.createObjectStore(this.objectStoreName, {keyPath: "id"});
                resolve();
            }
        });
    }

    get currentTask() {
        let task = localStorage.getItem(this.currentTaskLocalStorageKey);
        if(task == null) return null;
        return new ActiveTask(JSON.parse(task));
    }

    set currentTask(task) {
        localStorage.setItem(this.currentTaskLocalStorageKey, JSON.stringify(task));
    }



    async nextId() {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([this.objectStoreName]);
            let objectStore = transaction.objectStore(this.objectStoreName);

            let maxId = 0;
            let request = objectStore.openCursor();

            request.onsuccess = (event) => {
                let cursor = event.target.result;
                if (cursor) {
                    if(this.keyIsForToday(cursor.key)) {
                        let id = this.extractId(cursor.key);
                        if(id > maxId) {
                            maxId = id;
                        }
                    }
                    cursor.continue();
                } else {
                    resolve(this.keyStart() + String(maxId + 1).padStart(4, '0'));
                }
            };

            request.onerror = (event) => {
                reject("Error occurred in cursor request",event);
            };
        });
    }

    async addOrUpdate(activeTask) {
        return new Promise((resolve, reject) => {
            if(activeTask.id == null) {
                this.nextId().then((id) => {
                    activeTask.id = id;
                    let request = this.db.transaction([this.objectStoreName], "readwrite")
                        .objectStore(this.objectStoreName)
                        .add({id: activeTask.id, name: activeTask.name, started: activeTask.started,
                            lastCheckin: activeTask.lastCheckin, timeDistracted: activeTask.timeDistracted,
                            distracted: activeTask.distracted, taskLength: activeTask.taskLength});

                    request.onsuccess = function () {
                        resolve();
                    };

                    request.onerror = function (event) {
                        reject("Unable to add data to the database! ",event);
                    }
                }).catch((error) => {
                    reject(error);
                });
            }else{
                reject("Updated Not implemented");
            }
        });
    }

    async readToday() {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([this.objectStoreName]);
            let objectStore = transaction.objectStore(this.objectStoreName);
            let startDate = this.todayStart;
            const keyRangeValue = IDBKeyRange.bound(startDate + "0", startDate + "9999");
            let request = objectStore.getAll(keyRangeValue);


            request.onerror = function (event) {
                reject("Unable to retrieve data from database!",event);
            };

            request.onsuccess = function () {
                // Do something with the request.result!
                if (request.result) {
                    let converted = request.result.map((item) => {
                        return new ActiveTask(item);
                    });
                    resolve(converted);
                } else {
                    reject("No data record found");
                }
            };
        });
    }

    keyStart() {
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let day = today.getDate();
        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }
        return  year + '-' + month + '-' + day + '->';
    }

    keyIsForToday(key) {
        return key.startsWith(this.todayStart);
    }

    extractId(key) {
        return parseInt(key.substring(this.todayStart.length));
    }
}





let testTime = 0;
function getTime()
{
    if(testTime > 0)
        return testTime;
    return new Date().getTime();
}
export class ActiveTask {
    constructor(storageItem) {

        this.id = null;
        this.started = getTime();
        this.name = null;
        this.lastCheckin = getTime();
        this.timeDistracted = 0;
        this.distracted = false;
        this.taskLength = 0;
        if(storageItem)
        {
            this.id = storageItem.id;
            this.started = storageItem.started;
            this.name = storageItem.name;
            this.lastCheckin = storageItem.lastCheckin;
            this.timeDistracted = storageItem.timeDistracted;
            this.distracted = storageItem.distracted;
            this.taskLength = storageItem.taskLength;
        }
    }

    stillWorkingAction() {
        if (this.started <= 0) {
            console.error("Cannot checkin task that has not started");
            return;
        }
        if (this.distracted) {
            this.distractedAction();
            this.distracted = false;
        } else {
            let n = getTime();
            let p = n - this.lastCheckin;
            this.lastCheckin = n;
            this.taskLength += p;
        }
    }

    distractedAction() {
        let n = getTime();
        let p = n - this.lastCheckin;
        this.distracted = true;
        this.lastCheckin = n;
        this.timeDistracted += p;
    }

    complete() {
        if (this.started <= 0) {
            console.error("Cannot complete task that has not started");
            return;
        }
        this.stillWorkingAction()
    }
}