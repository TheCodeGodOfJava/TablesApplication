import { ProtoAction } from './protoAction';

export interface AnchorPointAction extends ProtoAction {
  getAction: () => void;
  getShowCondition: () => boolean;
  color?: string;
}
