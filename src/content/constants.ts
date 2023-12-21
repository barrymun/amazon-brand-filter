export const actionContainerWidth: string = "200px";
export const actionContainerHeight: string = "300px";

export const actionContainerId: string = "action-container";
export const actionContainerClosedStyle: string = `
    width: 0;
`;
export const actionContainerOpenStyle: string = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: ${actionContainerWidth};
    height: ${actionContainerHeight};
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    z-index: 10001;
    background-color: #fff;
`;

export enum MessageType {
  actionClicked = "actionClicked",
  actionClickedResponse = "actionClickedResponse",
}

export interface Message {
  type: MessageType;
}
