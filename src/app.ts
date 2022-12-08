let weakId = 0;

// Project Type
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener = (items: Project[]) => void;

class ProjectState {
    private static instance: ProjectState;
    private projects: Project[] = [];
    private listeners: Listener[] = [];

    private constructor() {}

    public static getInstance() {
        if (this.instance) {
            return this.instance;
        }

        this.instance = new ProjectState();
        return this.instance;
    }

    public addListener(listerFn: Listener) {
        this.listeners.push(listerFn);
    }

    public addProject (title: string, description: string, people: number) {
        const project = new Project(
            weakId++,
            title,
            description,
            people,
            ProjectStatus.Active
        );

        this.projects.push(project);
        this.listen();
    }

    private listen() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

// Validation

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(obj: Validatable): boolean {
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

function Autobind(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };

  return adjDescriptor;
}

class ProjectList {
  private templateElement: HTMLTemplateElement;
  private hostElement: HTMLDivElement;
  private mainElement: HTMLElement;
  private assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    this.templateElement = document.getElementById(
      "project-list"
    ) as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.assignedProjects = [];

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.mainElement = importedNode.firstElementChild as HTMLElement;
    this.mainElement.id = `${type}-projects`;

    projectState.addListener((projects: Project[]) => {
        this.assignedProjects = projects;
        this.renderProjects();
    })


    this.attach();
    this.renderContent();
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.mainElement.querySelector("ul")!.id = listId;
    this.mainElement.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProjects() {
    const listEl = document.getElementById(
        `${this.type}-projects-list`
      )! as HTMLUListElement;
      for (const prjItem of this.assignedProjects) {
        const listItem = document.createElement('li');
        listItem.textContent = prjItem.title;
        listEl.appendChild(listItem);
      }
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.mainElement);
  }
}

class ProjectInput {
  private templateElement: HTMLTemplateElement;
  private hostElement: HTMLDivElement;
  private formElement: HTMLFormElement;

  private titleInputfield: HTMLInputElement;
  private descriptionInputfield: HTMLInputElement;
  private peopleInputfield: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.formElement = importedNode.firstElementChild as HTMLFormElement;
    this.attach();

    this.formElement.id = "user-input";

    this.titleInputfield = this.formElement.querySelector(
      "#title"
    )! as HTMLInputElement;
    this.descriptionInputfield = this.formElement.querySelector(
      "#description"
    )! as HTMLInputElement;
    this.peopleInputfield = this.formElement.querySelector(
      "#people"
    )! as HTMLInputElement;

    this.configure();
  }

  private getUserInput(): [string, string, number] | void {
    const title = this.titleInputfield.value;
    const desc = this.descriptionInputfield.value;
    const people = this.peopleInputfield.value;

    const titleValidator: Validatable = {
      value: title,
      required: true,
    };

    const descValidator: Validatable = {
      value: desc,
      required: true,
      minLength: 5,
      maxLength: 100,
    };

    const peopleValidator: Validatable = {
      value: +people,
      required: true,
      min: 1,
      max: 5,
    };

    console.log(people);

    if (
      !(
        validate(titleValidator) &&
        validate(descValidator) &&
        validate(peopleValidator)
      )
    )
      return;
    console.log(validate(peopleValidator));

    return [title, desc, +people];
  }

  private clearContent(): void {
    this.titleInputfield.value = "";
    this.descriptionInputfield.value = "";
    this.peopleInputfield.value = "";
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.getUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearContent();
    }
  }

  private configure() {
    this.formElement.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.formElement);
  }
}

const projectState = ProjectState.getInstance();
const projectInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
