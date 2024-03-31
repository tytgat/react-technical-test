import {FunctionComponent} from "react";
import {LocalizedPokemon} from "src/components/PokemonList.tsx";

type PokemonEntryProps = {
  localizedPokemon: LocalizedPokemon
}

const PokemonEntry: FunctionComponent<PokemonEntryProps> = (props: PokemonEntryProps) => {
  const {pokemon, name} = props.localizedPokemon

  const sprite = pokemon.sprites.other?.["official-artwork"].front_default || "src/assets/pokeball.png"

  return (
    <div className={"pokemon-entry"}>
      <div>
        <div style={{display: "flex", alignItems: "baseline", gap:5}}>
          <h4>#{pokemon.id}</h4><h1>{name}</h1>
        </div>
        <div style={{display: "flex", gap: 5}}>{pokemon.types.map((type) => (
          <div className={"pokemon-type"} key={type.type.name}>{type.type.name}</div>))}</div>
      </div>
      <img src={sprite} width={"300px"} height={"300px"} alt={name}/>
    </div>
  )
}

export default PokemonEntry;
