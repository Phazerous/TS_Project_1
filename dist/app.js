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
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listerFn) {
        this.listeners.push(listerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
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
// Base Component
class Component {
    constructor(templateId, hostId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtStart) {
        this.hostElement.insertAdjacentElement(insertAtStart ? "afterbegin" : "beforeend", this.element);
    }
}
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    configure() {
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = '';
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement("li");
            listItem.textContent = prjItem.title;
            listEl.appendChild(listItem);
        }
    }
}
class ProjectInput extends Component {
    constructor() {
        super("project-input", "app", true, `user-input`);
        this.titleInputfield = this.element.querySelector("#title");
        this.descriptionInputfield = this.element.querySelector("#description");
        this.peopleInputfield = this.element.querySelector("#people");
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
    renderContent() { }
    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
const projectState = ProjectState.getInstance();
const projectInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList('finished');
