class ProjectInput {
    private templateElement: HTMLTemplateElement;
    private hostElement: HTMLDivElement;
    private formElement: HTMLFormElement;
    
    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);

        this.formElement = importedNode.firstElementChild as HTMLFormElement;
        this.attach();
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}

const projectInput = new ProjectInput();