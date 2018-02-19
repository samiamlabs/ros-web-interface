import RappStarterStore from '../RappStarterStore';
import Immutable from 'immutable';

it('has default state', () => {
  const availableRapps = RappStarterStore.getState().get('availableRapps');

  expect(availableRapps).toEqual(Immutable.fromJS({}));
});

it('stores available rapps in immutabe', () => {
  const name = 'guidebot_rapps/waypoint_navigation';
  const rapp = {
    name,
    display_name: 'Waypoint Navigation',
    status: 'Ready'
  };

  const availableRapps = [rapp];

  RappStarterStore.handleActions({
    type: 'AVAILABLE_RAPPS',
    availableRapps
  });

  const itemFromState = RappStarterStore.getState().getIn([
    'availableRapps',
    name
  ]);

  expect(itemFromState.get('name')).toEqual(name);
  expect(itemFromState.get('display_name')).toEqual('Waypoint Navigation');
  expect(itemFromState.get('status')).toEqual('Ready');
});
