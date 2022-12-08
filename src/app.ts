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

type Listener<T> = (items: T[]) => void;

abstract class State<T> {
  protected listeners: Listener<T>[] = [];

  public addListener(listerFn: Listener<T>) {
    this.listeners.push(listerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  public static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();
    return this.instance;
  }

  public addProject(title: string, description: string, people: number) {
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

// Base Component
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  private templateElement: HTMLTemplateElement;
  private hostElement: T;
  protected element: U;

  constructor(
    templateId: string,
    hostId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  private assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(prj => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      })

      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  private titleInputfield: HTMLInputElement;
  private descriptionInputfield: HTMLInputElement;
  private peopleInputfield: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, `user-input`);

    this.titleInputfield = this.element.querySelector(
      "#title"
    )! as HTMLInputElement;
    this.descriptionInputfield = this.element.querySelector(
      "#description"
    )! as HTMLInputElement;
    this.peopleInputfield = this.element.querySelector(
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

  renderContent() {}
  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
}

const projectState = ProjectState.getInstance();
const projectInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList('finished');
