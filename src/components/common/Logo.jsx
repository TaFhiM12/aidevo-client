import { Link } from 'react-router';
import { motion } from 'framer-motion';

const Logo = () => {
    return (
        <Link to="/" className="inline-block">
            <motion.div
                className="flex items-center gap-3 group cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
            >
                {/* Icon/Symbol */}
                

                {/* Text */}
                <div className="flex flex-col">
                    <motion.span
                        className="text-2xl font-black leading-none bg-gradient-to-r from-[#4bbeff] via-[#6ecfff] to-[#f4e90a] bg-clip-text text-transparent bg-[length:300%_auto] group-hover:bg-[position:100%_0] transition-all duration-1000"
                        whileHover={{ scale: 1.05 }}
                    >
                        Aidevo
                    </motion.span>
                    <motion.span 
                        className="text-[8px] font-bold text-gray-600 tracking-widest uppercase mt-1 group-hover:text-gray-800 transition-colors duration-300"
                        whileHover={{ scale: 1.1 }}
                    >
                        Empower • Connect • Serve
                    </motion.span>
                </div>
            </motion.div>
        </Link>
    );
};

export default Logo;