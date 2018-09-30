Game.GangNameGenerator = function() {
    this.suffixes = [
        '100',
        '3',
        '7',
        '13',
        'Krunk',
        'Death',
        'Crank',
        'Lost',
        'Gold',
        'Chrome'
    ];

    this.names = [
        'Ravagers',
        'Crypts',
        'Bloods',
        'Tigers',
        'Keys',
        'Raptors',
        'Los Muertos',
        'Triad'
    ];

    this.name = function() {
        var n = '';
        if (ROT.RNG.getUniform() > 0.5)
            n += this.suffixes.random();

        if (!n.length || ROT.RNG.getUniform() > 0.5)
            n += n.length ? " " + this.names.random() : this.names.random();

        return n;
    }
}
