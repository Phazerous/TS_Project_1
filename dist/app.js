"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let weakId = 0;
// Project Type
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class ProjectState {
    constructor() {
        this.projects = [];
        this.listeners = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addListener(listerFn) {
        this.listeners.push(listerFn);
    }
    addProject(title, description, people) {
        const project = new Project(weakId++, title, description, people, ProjectStatus.Active);
        this.projects.push(project);
        this.listen();
    }
    listen() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
function validate(obj) {
    let isValid = true;
    if (obj.required) {
        isValid = isValid && obj.value.toString().trim().length !== 0;
    }
    if (obj.minLength != null && typeof obj.value === "string") {
        isValid = isValid && obj.value.length >= obj.minLength;
    }
    if (obj.maxLength != null && typeof obj.value === "string") {
        isValid = isValid && obj.value.length <= obj.maxLength;
    }
    if (obj.min != null && typeof obj.value === "number") {
        isValid = isValid && obj.value >= obj.min;
    }
    if (obj.max != null && typeof obj.value === "number") {
        isValid = isValid && obj.value <= obj.max;
    }
    return isValid;
}
// Autobind decorator
function Autobind(target, methodName, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}
class ProjectList {
    constructor(type) {
        this.type = type;
        this.assignedProjects = [];
        this.templateElement = document.getElementById("project-list");
        this.hostElement = document.getElementById("app");
        this.assignedProjects = [];
        const importedNode = document.importNode(this.templateElement.content, true);
        this.mainElement = importedNode.firstElementChild;
        this.mainElement.id = `${type}-projects`;
        projectState.addListener((projects) => {
            this.assignedProjects = projects;
            this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.mainElement.querySelector("ul").id = listId;
        this.mainElement.querySelector("h2").textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = prjItem.title;
            listEl.appendChild(listItem);
        }
    }
    attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.mainElement);
    }
}
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById("project-input");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        this.formElement = importedNode.firstElementChild;
        this.attach();
        this.formElement.id = "user-input";
        this.titleInputfield = this.formElement.querySelector("#title");
        this.descriptionInputfield = this.formElement.querySelector("#description");
        this.peopleInputfield = this.formElement.querySelector("#people");
        this.configure();
    }
    getUserInput() {
        const title = this.titleInputfield.value;
        const desc = this.descriptionInputfield.value;
        const people = this.peopleInputfield.value;
        const titleValidator = {
            value: title,
            required: true,
        };
        const descValidator = {
            value: desc,
            required: true,
            minLength: 5,
            maxLength: 100,
        };
        const peopleValidator = {
            value: +people,
            required: true,
            min: 1,
            max: 5,
        };
        console.log(people);
        if (!(validate(titleValidator) &&
            validate(descValidator) &&
            validate(peopleValidator)))
            return;
        console.log(validate(peopleValidator));
        return [title, desc, +people];
    }
    clearContent() {
        this.titleInputfield.value = "";
        this.descriptionInputfield.value = "";
        this.peopleInputfield.value = "";
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.getUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearContent();
        }
    }
    configure() {
        this.formElement.addEventListener("submit", this.submitHandler);
    }
    attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.formElement);
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
const projectState = ProjectState.getInstance();
const projectInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
