import React from 'react'
import '../styles/pokedex.scss'

/**
 * Todos
 * - [ ] Automatically travel to find pokemon (procedural movements on terrain types)
 * - [ ] You can click on pokemon you have discovered to learn more about them.
 * - [ ] More details on the "PokeCard"
 */
const db = {}

const request = async (url) => {
  const response = await fetch(url)
  const data = await response.json()
  return data
}

const getRandomPokemon = async () => {
  const id = Math.floor(Math.random() * 151) + 1
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

const PokeCard = ({ pokemon, filteredName, discovered }) => (
  <div className={`pokecard ${discovered ? '' : 'undescovered'}`}>
    <PokeImage pokemon={pokemon} discovered={discovered} />
    <div>
      <h4>{filteredName || pokemon.name}</h4>
      <footer>
        {pokemon.types.map(({type}) => (
          <span className={type.name}>{type.name}</span>
        ))}
      </footer>
    </div>
  </div>
)

const filterName = (name, guesses) => {
  const nameArr = name.split('')
  return nameArr.map(char => guesses.indexOf(char) === -1 ? '_' : char).join('')
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

const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('')
const Letters = ({ guesses, onClick }) => (
  <div className='letters'>
    {allLetters.map(char => <button type="button" disabled={guesses.indexOf(char) !== -1} onClick={e => e.preventDefault && onClick(char)}>{char}</button>)}
  </div>
)

class Pokedex extends React.Component {
  state = {
    encounter: null,
    discovered: {}
  }

  encounter = async (e) => {
    e.preventDefault()
    const { discovered } = this.state
    const encounter = await getRandomPokemon()
    // set the encounter
    const newState = { encounter }

    // set the discovered
    if (!discovered[encounter]) {
      newState.discovered = {
        ...discovered,
        [encounter]: []
      }
    }
    this.setState(newState)
  }

  guess = (letter) => {
    const { encounter, discovered } = this.state
    if (encounter && discovered[encounter] && discovered[encounter].indexOf(letter) === -1) {
      const newArr = [
        ...discovered[encounter],
        letter
      ]

      // check and see if they got then all
      const name = db[encounter].name
      console.log('newArr', newArr)
      if (filterName(name, newArr) === name) {
        this.setState({
          discovered: {
            ...discovered,
            [encounter]: true
          }
        })
      } else {
        this.setState({
          discovered: {
            ...discovered,
            [encounter]: newArr
          }
        })
      }
    }
  }

  render () {
    console.log('this.state', this.state)
    const { encounter, discovered } = this.state
    return (
      <main>
        <header>
          <button onClick={this.encounter}>Encounter</button>
        </header>
        {encounter && (
          <section>
            <PokeJumbo pokemon={db[encounter]} guesses={discovered[encounter]} />
            {discovered[encounter] !== true && <Letters guesses={discovered[encounter]} onClick={this.guess} />}
          </section>
        )}
        <aside>
          {Object.values(db).map(pokemon => (
            <PokeCard key={pokemon.id} pokemon={pokemon} discovered={discovered[pokemon.id]} />
          ))}
        </aside>
      </main>
    )
  }
}

export default Pokedex
