"use strict";
// autobind decorator
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function autobind(_, _2, descriptor) {
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
//
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
    submitHanlder(event) {
        event.preventDefault();
        console.log(this.titleInputfield.value);
    }
    configure() {
        this.formElement.addEventListener('submit', this.submitHanlder);
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}
__decorate([
    autobind
], ProjectInput.prototype, "submitHanlder", null);
const projectInput = new ProjectInput();
