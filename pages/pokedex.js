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

const PokeCard = ({ pokemon, discovered }) => (
  <div className={`pokecard ${discovered ? '' : 'undescovered'}`}>
    <img src={pokemon.sprites.front_default} />
    <div>
      <h4>{pokemon.name}</h4>
      <footer>
        {pokemon.types.map(({type}) => (
          <span className={type.name}>{type.name}</span>
        ))}
      </footer>
    </div>
  </div>
)

class Pokedex extends React.Component {
  state = {
    encounter: null,
    discovered: []
  }

  encounter = async (e) => {
    e.preventDefault()
    const encounter = await getRandomPokemon()
    console.log(db[encounter])
    this.setState({
      encounter
    })
  }

  discover = async (e) => {
    e.preventDefault()
    const { encounter, discovered } = this.state
    if (encounter && discovered.indexOf(encounter) === -1) {
      this.setState({
        discovered: [...discovered, encounter]
      })
    }
  }

  render () {
    const { encounter, discovered } = this.state
    return (
      <main>
        <header>
          <button onClick={this.encounter}>Encounter</button>
          <button onClick={this.discover}>Scan</button>
          {encounter && <PokeCard pokemon={db[encounter]} discovered={discovered.indexOf(encounter) !== -1} />}
        </header>
        <section>
          {Object.values(db).map(pokemon => (
            <PokeCard key={pokemon.id} pokemon={pokemon} discovered={discovered.indexOf(pokemon.id) !== -1} />
          ))}
        </section>
      </main>
    )
  }
}

export default Pokedex
