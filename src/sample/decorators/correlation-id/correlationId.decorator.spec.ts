import { CorrId } from './correlation-id.decorator';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Constants } from '../../constants/constants';

function getParamDecoratorFactory(decorator: (...args: any[]) => any) {
  class Test {
    public test(@decorator() _: any) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}
describe('CorrelationIdDecorator', () => {
  let paramDecorator: ParameterDecorator;
  beforeEach(() => {
    paramDecorator = CorrId;
  });

  it('should be defined', () => {
    expect(paramDecorator).toBeDefined();
  });

  it('check valid', () => {
    const value = 100000;
    const mockupCtx = {
      switchToHttp: () => {
        return {
          getRequest: () => {
            return { [Constants.correlationId]: value };
          },
        };
      },
    };
    const factory = getParamDecoratorFactory(CorrId);
    expect(factory(null, mockupCtx)).toEqual(value);
  });
});
