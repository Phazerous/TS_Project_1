// autobind decorator

function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
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

//
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

    @autobind
    private submitHanlder(event: Event) {
        event.preventDefault();
        console.log(this.titleInputfield.value);
    }

    private configure() {
        this.formElement.addEventListener('submit', this.submitHanlder);
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}

const projectInput = new ProjectInput();