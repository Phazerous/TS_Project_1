// Validation

interface Validatable {
    value: string | number,
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    min?: number,
    max?: number
}

function validate(obj: Validatable): boolean {
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

function Autobind(target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    
    return adjDescriptor;
}

class ProjectInput {
    private templateElement: HTMLTemplateElement;
    private hostElement: HTMLDivElement;
    private formElement: HTMLFormElement;

    private titleInputfield: HTMLInputElement;
    private descriptionInputfield: HTMLInputElement;
    private peopleInputfield: HTMLInputElement;
    
    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);

        this.formElement = importedNode.firstElementChild as HTMLFormElement;
        this.attach();

        this.formElement.id = 'user-input';

        this.titleInputfield = this.formElement.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputfield = this.formElement.querySelector('#description')! as HTMLInputElement;
        this.peopleInputfield = this.formElement.querySelector('#people')! as HTMLInputElement;

        this.configure();
    }

    private getUserInput(): [string, string, number] | void {
        const title = this.titleInputfield.value;
        const desc = this.descriptionInputfield.value;
        const people = this.peopleInputfield.value;

        const titleValidator: Validatable = {
            value: title,
            required: true
        }

        const descValidator: Validatable = {
            value: desc,
            required: true,
            minLength: 5,
            maxLength: 100
        }

        const peopleValidator: Validatable = {
            value: +people,
            required: true,
            min: 1,
            max: 5
        }

        console.log(people);

        if (!(validate(titleValidator) && validate(descValidator) && validate(peopleValidator))) return;
        console.log(validate(peopleValidator));

        return [title, desc, +people];
    }

    private clearContent(): void {
        this.titleInputfield.value = '';
        this.descriptionInputfield.value = '';
        this.peopleInputfield.value = '';
    }

    @Autobind
    private submitHanlder(event: Event) {
        event.preventDefault();
        
        const userData = this.getUserInput();

        if (userData) {
            const [title, desc, people] = userData;
            console.log(title, desc, people)
            this.clearContent();
        } else {
            alert('Wrong input.');
        }
    }

    private configure() {
        this.formElement.addEventListener('submit', this.submitHanlder);
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}

const projectInput = new ProjectInput();