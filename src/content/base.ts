import { actionContainerId, actionContainerWidth } from "utils/config";
import { State } from "utils/state";

export class Base {
  private state!: State;

  public getState = () => {
    return this.state;
  };

  private setState = (state: State) => {
    this.state = state;
  };

  actionContainer!: HTMLDivElement;

  public getActionContainer = () => {
    return this.actionContainer;
  };

  private setActionContainer = (actionContainer: HTMLDivElement) => {
    this.actionContainer = actionContainer;
  };

  constructor(state: State) {
    this.setState(state);
    this.setActionContainer(document.getElementById(actionContainerId)! as HTMLDivElement);
  }

  public isActionOpen = (): boolean => {
    return this.getActionContainer().style.width === actionContainerWidth;
  };
}
