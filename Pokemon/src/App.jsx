import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [nombre, setNombre] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [pokemones, setPokemones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarTodos, setMostrarTodos] = useState(true);

  // Cargar Pokémon iniciales al montar el componente
  useEffect(() => {
    cargarPokemonesIniciales();
  }, []);

  const cargarPokemonesIniciales = async () => {
    try {
      setLoading(true);
      // Cargar los primeros 20 Pokémon
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
      const data = await response.json();
      
      // Obtener los datos completos de cada Pokémon
      const pokemonPromises = data.results.map(async (poke) => {
        const res = await fetch(poke.url);
        return await res.json();
      });
      
      const pokemonData = await Promise.all(pokemonPromises);
      setPokemones(pokemonData);
    } catch (err) {
      console.error('Error cargando Pokémon:', err);
    } finally {
      setLoading(false);
    }
  };

  const buscarPokemon = async () => {
    if (!nombre.trim()) {
      // Si el campo está vacío, mostrar todos otra vez
      setMostrarTodos(true);
      setPokemon(null);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre.toLowerCase().trim()}`);
      
      if (!response.ok) {
        throw new Error('Pokémon no encontrado');
      }
      
      const data = await response.json();
      setPokemon(data);
      setMostrarTodos(false); // Ocultar la cuadrícula y mostrar solo el buscado
    } catch (err) {
      setError('Pokémon no encontrado. Intenta con otro nombre.');
      setPokemon(null);
      setMostrarTodos(true); // Mostrar todos si hay error
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarPokemon();
    }
  };

  const volverATodos = () => {
    setNombre('');
    setPokemon(null);
    setMostrarTodos(true);
    setError('');
  };

  return (
    <div className="App">
      <h1>Buscador de Pokémon</h1>
      
      <div className="buscador">
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe el nombre de un Pokémon..."
        />
        <button onClick={buscarPokemon} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        {!mostrarTodos && (
          <button onClick={volverATodos} className="btn-volver">
            Volver a todos
          </button>
        )}
      </div>

      {error && <div className="error">Error: {error}</div>}

      {/* Mostrar Pokémon individual cuando se busca */}
      {pokemon && !mostrarTodos && (
        <div className="pokemon-individual">
          <button onClick={volverATodos} className="btn-cerrar">×</button>
          <div className="pokemon-card individual">
            <div className="card-header">
              <h2>#{(pokemon.id || '').toString().padStart(3, '0')}</h2>
              <h3>{(pokemon.name || '').charAt(0).toUpperCase() + (pokemon.name || '').slice(1)}</h3>
            </div>
            
            <div className="card-image">
              <img 
                src={pokemon.sprites?.front_default || ''} 
                alt={pokemon.name || 'Pokémon'}
              />
            </div>
            
            <div className="card-types">
              {pokemon.types?.map((typeInfo, index) => (
                <span key={index} className={`type type-${typeInfo.type?.name || 'unknown'}`}>
                  {typeInfo.type?.name}
                </span>
              ))}
            </div>
            
            <div className="card-stats">
              <div className="stat">
                <span className="stat-label">Altura</span>
                <span className="stat-value">{pokemon.height / 10} m</span>
              </div>
              <div className="stat">
                <span className="stat-label">Peso</span>
                <span className="stat-value">{pokemon.weight / 10} kg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar grid de Pokémon cuando no se está buscando uno específico */}
      {mostrarTodos && (
        <div className="pokemon-grid">
          <h2>Pokémon Disponibles ({pokemones.length})</h2>
          
          {loading ? (
            <div className="loading">Cargando Pokémon...</div>
          ) : (
            <div className="grid-container">
              {pokemones.map((poke) => (
                <div key={poke.id} className="pokemon-card grid-card">
                  <div className="card-header">
                    <h2>#{poke.id.toString().padStart(3, '0')}</h2>
                    <h3>{poke.name.charAt(0).toUpperCase() + poke.name.slice(1)}</h3>
                  </div>
                  
                  <div className="card-image">
                    <img 
                      src={poke.sprites?.front_default || ''} 
                      alt={poke.name}
                      onClick={() => {
                        setPokemon(poke);
                        setMostrarTodos(false);
                        setNombre(poke.name);
                      }}
                    />
                  </div>
                  
                  <div className="card-types">
                    {poke.types?.map((typeInfo, index) => (
                      <span key={index} className={`type type-${typeInfo.type?.name || 'unknown'}`}>
                        {typeInfo.type?.name}
                      </span>
                    ))}
                  </div>
                  
                  <div className="card-stats">
                    <div className="stat">
                      <span className="stat-label">Altura</span>
                      <span className="stat-value">{poke.height / 10} m</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Peso</span>
                      <span className="stat-value">{poke.weight / 10} kg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App