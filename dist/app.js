"use strict";
// Validation
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function validate(obj) {
    let isValid = true;
    if (obj.required) {
        isValid = isValid && obj.value.toString().trim().length !== 0;
    }
    if (obj.minLength != null && typeof obj.value === 'string') {
        isValid = isValid && obj.value.length >= obj.minLength;
    }
    if (obj.maxLength != null && typeof obj.value === 'string') {
        isValid = isValid && obj.value.length <= obj.maxLength;
    }
    if (obj.min != null && typeof obj.value === 'number') {
        isValid = isValid && obj.value >= obj.min;
    }
    if (obj.max != null && typeof obj.value === 'number') {
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
        }
    };
    return adjDescriptor;
}
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.formElement = importedNode.firstElementChild;
        this.attach();
        this.formElement.id = 'user-input';
        this.titleInputfield = this.formElement.querySelector('#title');
        this.descriptionInputfield = this.formElement.querySelector('#description');
        this.peopleInputfield = this.formElement.querySelector('#people');
        this.configure();
    }
    getUserInput() {
        const title = this.titleInputfield.value;
        const desc = this.descriptionInputfield.value;
        const people = this.peopleInputfield.value;
        const titleValidator = {
            value: title,
            required: true
        };
        const descValidator = {
            value: desc,
            required: true,
            minLength: 5,
            maxLength: 100
        };
        const peopleValidator = {
            value: +people,
            required: true,
            min: 1,
            max: 5
        };
        console.log(people);
        if (!(validate(titleValidator) && validate(descValidator) && validate(peopleValidator)))
            return;
        console.log(validate(peopleValidator));
        return [title, desc, +people];
    }
    clearContent() {
        this.titleInputfield.value = '';
        this.descriptionInputfield.value = '';
        this.peopleInputfield.value = '';
    }
    submitHanlder(event) {
        event.preventDefault();
        const userData = this.getUserInput();
        if (userData) {
            const [title, desc, people] = userData;
            console.log(title, desc, people);
            this.clearContent();
        }
        else {
            alert('Wrong input.');
        }
    }
    configure() {
        this.formElement.addEventListener('submit', this.submitHanlder);
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHanlder", null);
const projectInput = new ProjectInput();
