import React from 'react'
import '../styles/pokedex.scss'

const db = {}

const request = async (url) => {
  const response = await fetch(url)
  const data = await response.json()
  return data
}

const getRandomPokemon = async () => {
  const id = Math.floor(Math.random() * 151) + 1
  if (db[id]) {
    return db[id]
  }
  const data = await request(`https://pokeapi.co/api/v2/pokemon/${id}/`)
  db[id] = data
  return id
}

const PokeCard = ({ pokemon, discovered }) => (
  <div className={`pokecard ${discovered ? '' : 'undescovered'}`}>
    <img src={pokemon.sprites.front_default} />
    <span>{pokemon.name}</span>
  </div>
)

export default class extends React.Component {
  state = {
    encounter: null,
    discovered: []
  }

  encounter = async (e) => {
    e.preventDefault()
    const encounter = await getRandomPokemon()
    this.setState({
      encounter
    })
  }

  discover = async (e) => {
    e.preventDefault()
    const { encounter, discovered } = this.state
    console.log('state', this.state)
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
        <button onClick={this.encounter}>Encounter</button>
        <button onClick={this.discover}>Scan</button>
        {encounter && <span className={discovered.indexOf(encounter) === -1 ? 'undescovered' : ''}><img src={db[encounter].sprites.front_default} /></span>}
        <section>
          {Object.values(db).map(pokemon => (
            <PokeCard key={pokemon.id} pokemon={pokemon} discovered={discovered.indexOf(pokemon.id) !== -1} />
          ))}
        </section>
      </main>
    )
  }
}
