import RuntimeMonitorStore from '../RuntimeMonitorStore';
import Immutable from 'immutable';

it('has default state', () => {
  const diagnosticItems = RuntimeMonitorStore.state.get('diagnosticItems');
  expect(diagnosticItems).toEqual(Immutable.fromJS({}));
});

it('receives new diagnostic items', () => {
  const diagnosticItem = {
    level: 0,
    name: 'left_wheel_driver: Connection',
    message: 'Connection OK',
    hardware_id: 'Left Wheel',
    values: [{key: 'up_time', value: 100}]
  };

  const diagnosticItems = [diagnosticItem];

  RuntimeMonitorStore.handleActions({
    type: 'DIAGNOSTIC_ITEMS',
    diagnosticItems
  });

  const itemFromState = RuntimeMonitorStore.state
    .get('diagnosticItems')
    .get('left_wheel_driver: Connection');

  expect(itemFromState.get('level')).toEqual(0);
  expect(itemFromState.get('message')).toEqual('Connection OK');
  expect(itemFromState.get('hardware_id')).toEqual('Left Wheel');
  expect(itemFromState.getIn(['values', 0, 'key'])).toEqual('up_time');
  expect(itemFromState.getIn(['values', 0, 'value'])).toEqual(100);
});
