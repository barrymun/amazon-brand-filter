import { Base } from "./base";
import { actionContainerClosedStyle, actionContainerOpenStyle } from "./constants";

export class ActionController extends Base {
  public toggleVisibility = () => {
    if (this.isActionOpen()) {
      this.getActionContainer().setAttribute("style", actionContainerClosedStyle);
    } else {
      this.getActionContainer().setAttribute("style", actionContainerOpenStyle);
    }
  };
}
