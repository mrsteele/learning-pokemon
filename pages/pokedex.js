import React from 'react'
import '../styles/pokedex.scss'

/**
 * Todos
 * - [ ] Automatically travel to find pokemon (procedural movements on terrain types)
 * - [ ] Create a details pane to see information about discovered pokemon
 */
const db = {}
const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('')

const request = async (url) => {
  const response = await fetch(url)
  const data = await response.json()
  return data
}

const totalPokemon = 151 // should be 151
const getRandomPokemon = async () => {
  const id = Math.floor(Math.random() * totalPokemon) + 1
  if (db[id]) {
    return id
  }
  const data = await request(`https://pokeapi.co/api/v2/pokemon/${id}/`)
  db[id] = data
  return id
}

const PokeImage = ({ pokemon, discovered }) => (
  <img src={pokemon.sprites.front_default} className={`pokeimage ${discovered ? '' : 'undescovered'}`} />
)

class PokeCard extends React.Component {
  onClick = (e) => {
    e.preventDefault()

    const { pokemon, discovered, onClick } = this.props

    if (discovered) {
      onClick(pokemon.id)
    }
  }

  render () {
    const { pokemon, filteredName, discovered } = this.props
    return (
      <div className={`pokecard ${discovered ? '' : 'undescovered'}`} onClick={this.onClick}>
        <PokeImage pokemon={pokemon} discovered={discovered} />
        <div>
          <h4>{filteredName || pokemon.name}</h4>
          <footer>
            {pokemon.types.map(({type}) => (
              <span key={type.name} className={type.name}>{type.name}</span>
            ))}
          </footer>
        </div>
      </div>
    )
  }
}

const filterName = (name, guesses) => {
  const nameArr = name.split('')
  return nameArr.map(char => guesses.indexOf(char) !== -1 || allLetters.indexOf(char) === -1 ? char : '_').join('')
}

const PokeJumbo = ({ pokemon, guesses }) => {
  const discovered = guesses === true
  return (
    <div className='pokejumbo'>
      <h3>{discovered ? pokemon.name : filterName(pokemon.name, guesses)}</h3>
      <PokeImage pokemon={pokemon} discovered={discovered} />
    </div>
  )
}

const Letters = ({ guesses, onClick }) => (
  <div className='letters'>
    {allLetters.map(char => <button key={char} type="button" disabled={guesses.indexOf(char) !== -1} onClick={e => e.preventDefault && onClick(char)}>{char}</button>)}
  </div>
)

class Pokedex extends React.Component {
  state = {
    encounter: null,
    discovered: {},
    won: false,
    walked: 0,
    pokeballs: 0
  }

  encounter = async (e) => {
    e.preventDefault()
    const { discovered, walked } = this.state
    if (!walked) {
      return
    }
    let encounter = null
    do {
      encounter = await getRandomPokemon()
    } while (discovered[encounter] === true)
    // set the encounter
    const newState = {
      encounter,
      walked: walked - 1,
    }

    // set the discovered
    if (!discovered[encounter]) {
      newState.discovered = {
        ...discovered,
        [encounter]: []
      }
    }
    this.setState(newState)
  }

  setEncounter = (id) => {
    const { encounter, discovered } = this.state
    if (!encounter || discovered[encounter] === true) {
      this.setState({ encounter: id })
    }
  }

  guess = (letter) => {
    const { encounter, discovered, pokeballs } = this.state
    if (pokeballs && encounter && discovered[encounter] && discovered[encounter].indexOf(letter) === -1) {
      const newPokeballs = pokeballs - 1
      const newArr = [
        ...discovered[encounter],
        letter
      ]

      // check and see if they got then all
      const name = db[encounter].name
      if (filterName(name, newArr) === name) {
        const newDiscovered = {
          ...discovered,
          [encounter]: true
        }
        const won = (Object.values(newDiscovered).filter(v => v === true).length === totalPokemon)
        this.setState({
          won,
          discovered: newDiscovered,
          pokeballs: newPokeballs
        })
      } else {
        const newEncounter = name.indexOf(letter) === -1 ? null : encounter
        this.setState({
          encounter: newEncounter,
          pokeballs: newPokeballs,
          discovered: {
            ...discovered,
            [encounter]: newArr
          }
        })
      }
    }
  }

  add = (prop) => {
    const value = this.state[prop]
    this.setState({
      [prop]: value + 1
    })
  }

  addPokeballs = (e) => {
    e.preventDefault()
    this.add('pokeballs')
  }

  addWalk = (e) => {
    e.preventDefault()
    this.add('walked')
  }

  render () {
    const { won, walked, pokeballs, encounter, discovered } = this.state
    return (
      <main>
        {!won && (
          <header>
            <button onClick={this.encounter} disabled={!walked}>Encounter</button>
            <button onClick={this.addWalk}>Walk ({walked})</button>
            <button onClick={this.addPokeballs}>Pokeballs ({pokeballs})</button>
          </header>
        )}
        {encounter && (
          <section>
            <PokeJumbo pokemon={db[encounter]} guesses={discovered[encounter]} />
            {discovered[encounter] !== true && (
              <div>{pokeballs ? <Letters guesses={discovered[encounter]} onClick={this.guess} /> : 'You need pokeballs to guess letters...'}</div>
            )}
          </section>
        )}
        <aside>
          {Object.values(db).map(pokemon => (
            <PokeCard key={pokemon.id} onClick={this.setEncounter} key={pokemon.id} pokemon={pokemon} discovered={discovered[pokemon.id] === true} />
          ))}
        </aside>
      </main>
    )
  }
}

export default Pokedex
