import { ProtoAction } from './protoAction';

export interface AnchorPointAction extends ProtoAction {
  getAction: () => void;
  getShowCondition: () => boolean;
  getDescription: () => string;
  color?: string;
}
