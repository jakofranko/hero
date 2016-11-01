Game.TemplateRepository = new Game.Repository('templates', Game.Template);

Game.TemplateRepository.define('studio apartment', {
	template: [
		'&O|t#l',
		'o +  c',
		'--| {[',
		'   +  '
	],
	templateKey: {
		't': {
			repository: 'ItemRepository',
			name: 'end table'
		},
		'#': {
			repository: 'ItemRepository',
			name: 'bed'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		'c': {
			repository: 'ItemRepository',
			name: 'chair'
		},
		'{': {
			repository: 'ItemRepository',
			name: 'oven'
		},
		'[': {
			repository: 'ItemRepository',
			name: 'refridgerator'
		},
		'+': {
			repository: 'TileRepository',
			name: 'door'
		},
		'|': {
			repository: 'TileRepository',
			name: 'indoor wall-vertical'
		},
		'-': {
			repository: 'TileRepository',
			name: 'indoor wall-horizontal'
		},
		'&': {
			repository: 'ItemRepository',
			name: 'toilet'
		},
		'0': {
			repository: 'ItemRepository',
			name: 'bathtub'
		},
		'o': {
			repository: 'ItemRepository',
			name: 'sink'
		},
	}
});

Game.TemplateRepository.define('one-bedroom apartment', {
	template: [
		'&O|dt#l',
		' o|c   ',
		'+-|---+',
		'       ',
		' cTc  {',
		'c   o [',
		'  +    '
	],
	templateKey: {
		't': {
			repository: 'ItemRepository',
			name: 'end table'
		},
		'#': {
			repository: 'ItemRepository',
			name: 'bed'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		'd': {
			repository: 'ItemRepository',
			name: 'desk'
		},
		'T': {
			repository: 'ItemRepository',
			name: 'table'
		},
		'c': {
			repository: 'ItemRepository',
			name: 'chair'
		},
		'{': {
			repository: 'ItemRepository',
			name: 'oven'
		},
		'[': {
			repository: 'ItemRepository',
			name: 'refridgerator'
		},
		'+': {
			repository: 'TileRepository',
			name: 'door'
		},
		'|': {
			repository: 'TileRepository',
			name: 'indoor wall-vertical'
		},
		'-': {
			repository: 'TileRepository',
			name: 'indoor wall-horizontal'
		},
		'&': {
			repository: 'ItemRepository',
			name: 'toilet'
		},
		'0': {
			repository: 'ItemRepository',
			name: 'bathtub'
		},
		'o': {
			repository: 'ItemRepository',
			name: 'sink'
		},
	}
});

Game.TemplateRepository.define('two-bedroom apartment', {
	template: [
		'&O| t#ld',
		'o +    c',
		'------+-',
		'c V     ',
		' CCC   {',
		'       [',
		'  cTc  o',
		'        ',
		'   ----+',
		'   |    ',
		'   |&oO ',
		'   ----+',
		'   |c   ',
		'   |dt#l',
		'   |---+',
		' +      '
	],
	templateKey: {
		't': {
			repository: 'ItemRepository',
			name: 'end table'
		},
		'#': {
			repository: 'ItemRepository',
			name: 'bed'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		'd': {
			repository: 'ItemRepository',
			name: 'desk'
		},
		'T': {
			repository: 'ItemRepository',
			name: 'table'
		},
		'c': {
			repository: 'ItemRepository',
			name: 'chair'
		},
		'C': {
			repository: 'ItemRepository',
			name: 'couch'
		},
		'V': {
			repository: 'ItemRepository',
			name: 'television'
		},
		'{': {
			repository: 'ItemRepository',
			name: 'oven'
		},
		'[': {
			repository: 'ItemRepository',
			name: 'refridgerator'
		},
		'+': {
			repository: 'TileRepository',
			name: 'door'
		},
		'|': {
			repository: 'TileRepository',
			name: 'indoor wall-vertical'
		},
		'-': {
			repository: 'TileRepository',
			name: 'indoor wall-horizontal'
		},
		'&': {
			repository: 'ItemRepository',
			name: 'toilet'
		},
		'0': {
			repository: 'ItemRepository',
			name: 'bathtub'
		},
		'o': {
			repository: 'ItemRepository',
			name: 'sink'
		},
	}
});